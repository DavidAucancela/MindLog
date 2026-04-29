import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel
from ..database import get_db
from ..models.user import User
from ..models.entry import Entry
from ..dependencies import get_current_user
from ..services.claude import stream_chat_with_entries
from ..services.embeddings import find_relevant_entries

router = APIRouter(prefix="/chat", tags=["chat"])

_NO_ENTRIES_MSG = "Aún no tienes entradas en tu diario. ¡Empieza escribiendo hoy!"


class ChatRequest(BaseModel):
    question: str


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
        .limit(20)
    )
    entries = result.scalars().all()

    if not entries:
        async def _empty():
            yield f"data: {json.dumps({'chunk': _NO_ENTRIES_MSG})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(_empty(), media_type="text/event-stream")

    relevant = await find_relevant_entries(body.question, entries)

    async def _generate():
        async for chunk in stream_chat_with_entries(body.question, relevant):
            yield f"data: {json.dumps({'chunk': chunk})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        _generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
