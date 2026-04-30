from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from ..database import get_db
from ..models.user import User
from ..models.entry import Entry
from ..dependencies import get_current_user
from ..services.embeddings import generate_embedding
from ..services.claude import detect_mood

router = APIRouter(prefix="/entries", tags=["entries"])


class EntryCreate(BaseModel):
    content: str
    mood: Optional[str] = None


class EntryUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None


def _entry_dict(e: Entry) -> dict:
    return {
        "id": str(e.id),
        "content": e.content,
        "mood": e.mood,
        "created_at": e.created_at.isoformat(),
    }


@router.get("")
async def list_entries(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Entry)
        .where(Entry.user_id == current_user.id)
        .order_by(desc(Entry.created_at))
        .offset(skip)
        .limit(limit + 1)
    )
    rows = result.scalars().all()
    has_more = len(rows) > limit
    return {"data": {"entries": [_entry_dict(e) for e in rows[:limit]], "has_more": has_more}, "error": None}


@router.get("/{entry_id}")
async def get_entry(
    entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Entry).where(Entry.id == entry_id, Entry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")
    return {"data": _entry_dict(entry), "error": None}


@router.post("")
async def create_entry(
    body: EntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    embedding = await generate_embedding(body.content)
    try:
        mood = body.mood if body.mood else await detect_mood(body.content)
    except Exception:
        mood = body.mood or None

    entry = Entry(
        user_id=current_user.id,
        content=body.content,
        embedding=embedding,
        mood=mood,
    )
    db.add(entry)
    await db.flush()

    return {"data": _entry_dict(entry), "error": None}


@router.patch("/{entry_id}")
async def update_entry(
    entry_id: UUID,
    body: EntryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Entry).where(Entry.id == entry_id, Entry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    if body.content is not None:
        entry.content = body.content
        entry.embedding = await generate_embedding(body.content)
        if body.mood is None:
            try:
                entry.mood = await detect_mood(body.content)
            except Exception:
                pass

    if body.mood is not None:
        entry.mood = body.mood

    return {"data": _entry_dict(entry), "error": None}


@router.delete("/{entry_id}")
async def delete_entry(
    entry_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Entry).where(Entry.id == entry_id, Entry.user_id == current_user.id)
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entrada no encontrada")

    await db.delete(entry)
    return {"data": {"deleted": True}, "error": None}
