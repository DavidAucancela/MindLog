from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, desc, Date
from datetime import date, timedelta
from ..database import get_db
from ..models.user import User
from ..models.entry import Entry
from ..dependencies import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])


def _calculate_streak(dates: list) -> int:
    if not dates:
        return 0
    today = date.today()
    if dates[0] < today - timedelta(days=1):
        return 0
    streak = 0
    expected = dates[0]
    for d in dates:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        else:
            break
    return streak


@router.get("")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_res = await db.execute(
        select(func.count(Entry.id)).where(Entry.user_id == current_user.id)
    )
    total = total_res.scalar_one()

    dates_res = await db.execute(
        select(cast(Entry.created_at, Date))
        .where(Entry.user_id == current_user.id)
        .distinct()
        .order_by(cast(Entry.created_at, Date).desc())
    )
    dates = [row[0] for row in dates_res.fetchall()]
    streak = _calculate_streak(dates)

    mood_res = await db.execute(
        select(Entry.mood, func.count(Entry.mood).label("cnt"))
        .where(Entry.user_id == current_user.id, Entry.mood.isnot(None))
        .group_by(Entry.mood)
        .order_by(desc("cnt"))
        .limit(1)
    )
    mood_row = mood_res.first()
    top_mood = mood_row[0] if mood_row else None

    return {"data": {"total": total, "streak": streak, "top_mood": top_mood}, "error": None}
