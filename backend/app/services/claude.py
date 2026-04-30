import anthropic
from typing import List, Dict, AsyncIterator, Optional
from ..config import settings

client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

_CHAT_SYSTEM_BASE = (
    "Sos alguien que conoce bien al usuario porque leyó todo su diario. "
    "Hablás de forma directa y cercana, como un amigo que recuerda lo que el otro le contó. "
    "No menciones 'tus entradas' ni expliques de dónde sacás la información — simplemente hablá. "
    "Respondé en 2-3 oraciones como máximo. Si la conversación lo pide, podés ser un poco más extenso. "
    "Si algo no está claro en el diario, decilo y preguntá. "
    "Nunca sonés a terapeuta, coach ni chatbot — sé humano. "
    "Respondé siempre en el idioma del usuario."
)


async def stream_chat_with_entries(
    question: str,
    entries: List[str],
    history: Optional[List[Dict[str, str]]] = None,
    user_context: Optional[str] = None,
) -> AsyncIterator[str]:
    entries_text = "\n\n".join(f"[{i + 1}]: {e}" for i, e in enumerate(entries))
    context_block = f"\n\nLo que sé de esta persona:\n{user_context}" if user_context else ""
    system = f"{_CHAT_SYSTEM_BASE}{context_block}\n\nDiario del usuario:\n{entries_text}"

    messages = list(history or []) + [{"role": "user", "content": question}]

    async with client.messages.stream(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system,
        messages=messages,
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


async def update_user_context(
    conversation: List[Dict[str, str]],
    existing_context: Optional[str] = None,
) -> str:
    conversation_text = "\n".join(
        f"{'Usuario' if m['role'] == 'user' else 'Asistente'}: {m['content']}"
        for m in conversation
    )
    existing_block = f"\nContexto previo:\n{existing_context}\n" if existing_context else ""

    message = await client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=400,
        system=(
            "Sos un sistema que mantiene un perfil conciso de una persona a partir de sus conversaciones de diario.\n"
            "Tu tarea: actualizar el perfil con lo aprendido en la conversación nueva.\n"
            "El perfil debe contener solo datos concretos: temas recurrentes, datos personales mencionados, "
            "patrones emocionales, relaciones importantes, metas o preocupaciones.\n"
            "Formato: viñetas cortas, sin interpretaciones ni juicios. Máximo 250 palabras.\n"
            "Si no hay nada nuevo relevante, devolvé el perfil anterior sin cambios.\n"
            "Respondé solo con el perfil actualizado, sin encabezados ni explicaciones."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"{existing_block}\nConversación nueva:\n{conversation_text}\n\n"
                    "Actualizá el perfil."
                ),
            }
        ],
    )
    return message.content[0].text.strip()
