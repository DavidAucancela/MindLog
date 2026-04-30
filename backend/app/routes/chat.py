import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..database import get_db
from ..models.user import User
from ..models.entry import Entry
from ..dependencies import get_current_user
from ..services.claude import stream_chat_with_entries, update_user_context
from ..services.embeddings import find_relevant_entries

router = APIRouter(prefix="/chat", tags=["chat"])

_NO_ENTRIES_MSG = "Aún no tenés entradas en tu diario. ¡Empezá escribiendo hoy!"


class ChatRequest(BaseModel):
    question: str
    history: Optional[List[Dict[str, str]]] = []


@router.post("/stream")
async def chat_stream(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Entry)
        .where(Entry.user_id == current_user.id)
        .order_by(desc(Entry.created_at))
        .limit(200)
    )
    entries = result.scalars().all()

    if not entries:
        async def _empty():
            yield f"data: {json.dumps({'chunk': _NO_ENTRIES_MSG})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_empty(), media_type="text/event-stream")

    relevant = await find_relevant_entries(body.question, entries)

    async def _generate():
        async for chunk in stream_chat_with_entries(
            body.question, relevant, body.history, current_user.context
        ):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


class CloseRequest(BaseModel):
    history: List[Dict[str, str]]


@router.post("/close")
async def close_chat(
    body: CloseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not body.history:
        return {"data": {"updated": False}, "error": None}

    new_context = await update_user_context(body.history, current_user.context)
    current_user.context = new_context
    await db.flush()

    return {"data": {"updated": True}, "error": None}
