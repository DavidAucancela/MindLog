from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, date, timedelta, timezone
from ..database import get_db
from ..models.user import User
from ..models.entry import Entry
from ..dependencies import get_current_user
from ..services.claude import generate_daily_summary

router = APIRouter(prefix="/summary", tags=["summary"])


@router.get("/daily")
async def daily_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = today_start + timedelta(days=1)

    result = await db.execute(
        select(Entry)
        .where(
            Entry.user_id == current_user.id,
            Entry.created_at >= today_start,
            Entry.created_at < today_end,
        )
        .order_by(Entry.created_at)
    )
    entries = result.scalars().all()

    if not entries:
        return {"data": {"summary": None, "message": "No hay entradas para hoy todavía."}, "error": None}

    summary = await generate_daily_summary([e.content for e in entries])
    return {"data": {"summary": summary}, "error": None}
