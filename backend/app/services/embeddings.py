from typing import List, Optional
from ..models.entry import Entry


async def generate_embedding(text: str) -> Optional[List[float]]:
    """
    MVP: retorna None (sin embeddings por ahora).
    Para producción: integrar con text-embedding-3-small de OpenAI.
    """
    return None


async def find_relevant_entries(question: str, entries: List[Entry]) -> List[str]:
    """
    MVP: retorna las 5 entradas más recientes.
    Para producción: calcular similitud coseno entre embedding de la pregunta
    y embeddings guardados en la columna entry.embedding.
    """
    recent = sorted(entries, key=lambda e: e.created_at, reverse=True)[:5]
    return [e.content for e in recent]
