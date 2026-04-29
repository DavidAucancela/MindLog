import anthropic
from typing import List, AsyncIterator
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

_CHAT_SYSTEM = (
    "Sos un interlocutor cercano que leyó el diario del usuario. "
    "Respondé directo, como en una conversación real: sin introducir frases como "
    "'basándome en tus entradas' ni explicar de dónde viene lo que decís. "
    "Sé breve y concreto — máximo 2-3 oraciones por respuesta. "
    "Si no hay suficiente información para responder, decilo simple y preguntá algo. "
    "Tono: cercano, honesto, sin sonar a terapeuta ni a chatbot. "
    "Respondé siempre en el idioma del usuario."
)


async def chat_with_entries(question: str, entries: List[str]) -> str:
    entries_text = "\n\n".join(f"[Entrada {i + 1}]: {e}" for i, e in enumerate(entries))

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_CHAT_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": f"Mis entradas de diario:\n{entries_text}\n\nMi pregunta: {question}",
            }
        ],
    )
    return message.content[0].text


async def stream_chat_with_entries(question: str, entries: List[str]) -> AsyncIterator[str]:
    entries_text = "\n\n".join(f"[Entrada {i + 1}]: {e}" for i, e in enumerate(entries))

    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=_CHAT_SYSTEM,
        messages=[
            {
                "role": "user",
                "content": f"Mis entradas de diario:\n{entries_text}\n\nMi pregunta: {question}",
            }
        ],
    ) as stream:
        async for text in stream.text_stream:
            yield text


async def generate_daily_summary(entries: List[str]) -> str:
    entries_text = "\n\n".join(f"[{i + 1}]: {e}" for i, e in enumerate(entries))

    message = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        system=(
            "Resume el día del usuario a partir de sus entradas de diario.\n"
            "El resumen debe:\n"
            "- Empezar reconociendo algo positivo del día\n"
            "- Identificar el tema o emoción dominante\n"
            "- Terminar con una pregunta reflexiva para mañana\n"
            "- Tono: cálido, sin juicios. Máximo 150 palabras.\n"
            "Responde en el idioma del usuario."
        ),
        messages=[
            {
                "role": "user",
                "content": f"Mis entradas de hoy:\n{entries_text}\n\nGenera mi resumen del día.",
            }
        ],
    )
    return message.content[0].text


async def detect_mood(content: str) -> str:
    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=10,
        messages=[
            {
                "role": "user",
                "content": (
                    "Analizá el estado de ánimo de esta entrada y respondé con UNA sola palabra "
                    "eligiendo entre: calmo, inquieto, pensativo, grato, triste, enfocado.\n\n"
                    f"Entrada: {content}\n\nEstado de ánimo:"
                ),
            }
        ],
    )
    return message.content[0].text.strip().lower()
