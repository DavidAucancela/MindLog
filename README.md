# MindLog

App móvil de diario personal con IA. El usuario escribe entradas libres y puede conversar con ellas mediante la Claude API. FastAPI backend + Expo mobile.

## Stack

| Capa | Tecnología |
|------|-----------|
| Mobile | Expo SDK 54, React Native, Expo Router (file-based), TypeScript |
| Estado | Zustand + TanStack Query v5, expo-secure-store |
| Backend | FastAPI, SQLAlchemy async (asyncpg), PostgreSQL (Supabase) |
| Auth | JWT con python-jose + passlib[bcrypt] |
| IA — chat | Claude API `claude-sonnet-4-6` (streaming SSE vía XHR) |
| IA — mood / contexto | `claude-haiku-4-5-20251001` (detección de emoción, extracción de perfil) |
| Embeddings | OpenAI `text-embedding-3-small` (opcional — fallback a recencia si no hay key) |
| Migraciones | Alembic async (`asyncio.run` + `async_engine_from_config`) |
| Deploy | Railway (backend), Expo EAS (mobile) |

## Estructura

```
mi-app/                           ← raíz = app Expo (este repo)
├── app/
│   ├── (auth)/login.tsx          ← login
│   ├── (auth)/register.tsx       ← registro
│   ├── (tabs)/index.tsx          ← lista de entradas (infinite scroll, 20/page)
│   ├── (tabs)/nueva.tsx          ← nueva entrada + mood selector
│   ├── (tabs)/chat.tsx           ← chat IA con historial (XHR streaming)
│   ├── (tabs)/perfil.tsx         ← perfil, avatar color, stats, resumen diario
│   └── entry/[id].tsx            ← detalle + edición inline
├── api/client.ts                 ← cliente HTTP centralizado (modo preview/real)
├── store/
│   ├── authStore.ts              ← token + user en SecureStore
│   ├── chatStore.ts              ← mensajes del chat en memoria
│   └── previewStore.ts           ← flag isPreview para modo demo
├── constants/theme.ts            ← design tokens (T)
└── backend/
    └── app/
        ├── main.py               ← FastAPI app, todos los routers
        ├── config.py             ← Settings (pydantic-settings, extra="ignore")
        ├── routes/auth.py        ← POST /auth/register, POST /auth/login, PATCH /auth/me
        ├── routes/entries.py     ← GET/POST /entries, GET/PATCH/DELETE /entries/{id}
        ├── routes/chat.py        ← POST /chat/stream, POST /chat/close
        ├── routes/stats.py       ← GET /stats (total, streak, top_mood)
        ├── routes/summary.py     ← GET /summary/daily (resumen IA del día)
        ├── services/claude.py    ← stream_chat_with_entries, generate_daily_summary,
        │                            detect_mood, update_user_context
        ├── services/embeddings.py← generate_embedding, find_relevant_entries
        ├── models/user.py        ← User (id, email, hashed_password, name, context)
        └── models/entry.py       ← Entry (id, user_id, content, mood, embedding, created_at)
```

## Features

- **Auth** — registro, login, logout, editar nombre de perfil (`PATCH /auth/me`)
- **Entradas** — crear, listar paginada (infinite scroll), ver detalle, editar inline, eliminar
- **Mood** — selector de 6 emociones (calmo, inquieto, pensativo, grato, triste, enfocado); detección automática por IA (Haiku) al guardar
- **Chat IA** — streaming SSE vía XHR, historial de conversación en memoria, entradas relevantes recuperadas por embeddings o recencia
- **Perfil acumulativo** — `users.context` (Text) actualizado por Haiku al cerrar conversación; inyectado en el system prompt en cada sesión de chat
- **Resumen diario** — tarjeta en perfil generada por Sonnet (disponible después de las 18 hs)
- **Embeddings semánticos** — búsqueda por cosine similarity (numpy); fallback a recencia si `OPENAI_API_KEY` no está configurada
- **Modo preview/demo** — entradas mock sin backend, limpiado correctamente al hacer login real
- **Avatar personalizable** — inicial + color picker (SecureStore)

## Migraciones Alembic

```bash
cd backend

# Base de datos nueva (sin tablas):
.venv/bin/alembic upgrade head

# Base de datos existente creada con create_all (baseline):
.venv/bin/alembic stamp 001
.venv/bin/alembic upgrade head

# Nueva migración:
.venv/bin/alembic revision --autogenerate -m "descripcion"
```

Migraciones existentes:
- `001_initial_schema` — tablas `users` + `entries`
- `002_add_user_context` — columna `context` (Text) en `users`

## Variables de entorno

**Backend** (`backend/.env`):
```
ANTHROPIC_API_KEY=...
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=...
JWT_ALGORITHM=HS256
OPENAI_API_KEY=...        # opcional — activa embeddings semánticos
```

**Mobile** (`.env` en raíz `mi-app/`):
```
EXPO_PUBLIC_API_URL=http://<tu-ip-local>:8000
```

## Cómo correr el proyecto

```bash
# Backend — SIEMPRE con 0.0.0.0 para que Expo Go en dispositivo físico lo alcance
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Si uvicorn loopea al arrancar (bytecode del paquete openai):
python -m compileall -q .venv/

# Mobile
npx expo start --ios

# Instalar deps mobile
npx expo install zustand @tanstack/react-query expo-secure-store
```
