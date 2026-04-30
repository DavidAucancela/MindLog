from typing import List, Optional
import numpy as np
from ..config import settings
from ..models.entry import Entry

_openai_client = None


def _get_client():
    global _openai_client
    if _openai_client is None and settings.OPENAI_API_KEY:
        from openai import AsyncOpenAI
        _openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    return _openai_client


async def generate_embedding(text: str) -> Optional[List[float]]:
    client = _get_client()
    if client is None:
        return None
    try:
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=text[:8000],  # límite conservador de tokens
        )
        return response.data[0].embedding
    except Exception:
        return None


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)


async def find_relevant_entries(question: str, entries: List[Entry]) -> List[str]:
    question_embedding = await generate_embedding(question)

    with_emb = [e for e in entries if e.embedding is not None]

    if not question_embedding or not with_emb:
        recent = sorted(entries, key=lambda e: e.created_at, reverse=True)[:5]
        return [e.content for e in recent]

    scored = sorted(
        with_emb,
        key=lambda e: _cosine_similarity(question_embedding, e.embedding),
        reverse=True,
    )
    return [e.content for e in scored[:5]]
