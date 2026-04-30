# MindLog — Contexto del proyecto

## Qué es esto
App móvil de diario personal con IA. El usuario escribe entradas libres y puede
conversar con ellas mediante Claude API. FastAPI backend + Expo mobile.

Este directorio (mi-app) es el proyecto Expo. El backend FastAPI está en backend/.

## Stack
- Mobile: Expo SDK 54, React Native, Expo Router (file-based routing), TypeScript
- Backend: FastAPI, SQLAlchemy async (asyncpg), PostgreSQL (Supabase)
- IA: Claude API (claude-sonnet-4-6) vía Anthropic SDK Python
- Mood detection: claude-haiku-4-5-20251001
- Embeddings: OpenAI text-embedding-3-small (opcional — fallback a recencia si no hay key)
- Auth: JWT con python-jose + passlib[bcrypt]
- Estado: Zustand + TanStack Query v5
- Migraciones: Alembic async (asyncio.run + async_engine_from_config)
- Deploy: Railway (backend), Expo EAS (mobile)

## Estructura del proyecto
```
mi-app/                        ← raíz = app mobile
├── app/
│   ├── (auth)/login.tsx       ← login
│   ├── (auth)/register.tsx    ← registro
│   ├── (tabs)/index.tsx       ← lista de entradas (infinite scroll, 20/page)
│   ├── (tabs)/nueva.tsx       ← nueva entrada + mood selector
│   ├── (tabs)/chat.tsx        ← chat IA con historial (XHR streaming)
│   ├── (tabs)/perfil.tsx      ← perfil, avatar color, stats, resumen diario
│   └── entry/[id].tsx         ← detalle + edición inline
├── api/client.ts              ← cliente HTTP centralizado (modo preview/real)
├── store/
│   ├── authStore.ts           ← token + user en SecureStore
│   ├── chatStore.ts           ← mensajes del chat
│   └── previewStore.ts        ← flag isPreview para modo demo
├── constants/theme.ts         ← design tokens (T)
└── backend/
    └── app/
        ├── main.py            ← FastAPI app, todos los routers
        ├── routes/auth.py     ← POST /auth/register, POST /auth/login, PATCH /auth/me
        ├── routes/entries.py  ← GET/POST /entries, GET/PATCH/DELETE /entries/{id}
        ├── routes/chat.py     ← POST /chat/stream, POST /chat/close
        ├── routes/stats.py    ← GET /stats (total, streak, top_mood)
        ├── routes/summary.py  ← GET /summary/daily (resumen IA del día)
        ├── services/claude.py ← stream_chat_with_entries, generate_daily_summary,
        │                         detect_mood, update_user_context
        ├── services/embeddings.py ← generate_embedding, find_relevant_entries
        └── models/            ← user.py (id, email, hashed_password, name, context),
                                  entry.py (id, user_id, content, mood, embedding, created_at)
```

## Convenciones
- Python: snake_case. TypeScript: camelCase. Componentes RN: PascalCase.
- Cada endpoint FastAPI va en su propio archivo en routes/
- Los servicios de IA van en services/ — nunca lógica de Claude directamente en routes
- Todas las respuestas de la API tienen forma: `{ data, error }`
- Variables de entorno: nunca hardcodeadas, siempre desde .env / EXPO_PUBLIC_

## Paleta de diseño (valores reales en constants/theme.ts)
- Fondo: #FAF8F4 (blanco cálido)
- Fondo input: #F0EDE7
- Texto principal: #2C2520
- Texto secundario: #8A7E76
- Texto terciario: #B5A89D
- Acento marrón: #8B6F47
- Acento IA (verde): #5C7A6E
- Bordes: #E8E3DC
- Alerta/warn: #C4714A
- Emociones: calmo #A8B5A0, inquieto #C4714A, pensativo #8B6F47,
             grato #D4A65A, triste #7A8FA0, enfocado #5C7A6E

## Perfil de usuario persistente (user.context)

La tabla `users` tiene columna `context: Text` que la IA actualiza al cerrar cada chat.
Este contexto se inyecta en el system prompt del chat para que la IA "recuerde" a la persona entre sesiones.

Flujo:
1. Usuario chatea → `/chat/stream` inyecta `user.context` en el system prompt
2. Usuario cierra conversación → `/chat/close` llama a `update_user_context` (Haiku) → guarda en `users.context`

Funciones clave:
- `services/claude.py:update_user_context(conversation, existing_context)` — extrae y fusiona perfil, viñetas, máx 250 palabras, usa claude-haiku-4-5-20251001
- `routes/chat.py:POST /chat/close` — recibe `{ history }`, actualiza contexto, retorna `{ data: { updated: bool } }`

El historial de conversación NO se persiste — solo el contexto destilado.

## Migraciones Alembic
```bash
cd backend

# BD nueva (sin tablas):
.venv/bin/alembic upgrade head

# BD existente creada con create_all (baseline):
.venv/bin/alembic stamp 001
.venv/bin/alembic upgrade head

# Nueva migración:
.venv/bin/alembic revision --autogenerate -m "descripcion"
```

Migraciones existentes:
- `001_initial_schema` — tablas users + entries
- `002_add_user_context` — columna `context` en users

## Patrones críticos
- Al hacer login/register exitoso: `stopPreview()` → `queryClient.clear()` → `setAuth()` → navegar
- Avatar color picker: usar `key={index}` no `key={color}` (hay colores duplicados)
- Eye button sobre TextInput: `position: 'absolute'`, no wrapper flex row
- Historial del chat: capturar ANTES de `addMessage()` del nuevo mensaje del usuario
- Contexto de entradas en IA: va en el `system` prompt, no en el mensaje del usuario
- No renderizar contenedores estilizados con contenido null — mostrar error o no renderizar

## Lo que NO hacer
- No uses expo-cli global, usa `npx expo`
- No uses class components en React Native, solo functional
- No pongas lógica de negocio en los componentes, va en el store o en api/
- No hagas llamadas directas a Claude API desde el mobile, siempre pasa por el backend
- No uses colores brillantes — este es un diario, el tono es íntimo y cálido

## Comandos útiles
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

## Variables de entorno
Backend (backend/.env):
- ANTHROPIC_API_KEY
- DATABASE_URL (formato: postgresql+asyncpg://...)
- JWT_SECRET, JWT_ALGORITHM=HS256
- OPENAI_API_KEY (opcional — activa embeddings semánticos)

Mobile (.env en raíz mi-app/):
- EXPO_PUBLIC_API_URL=http://<tu-ip-local>:8000

## Dev actual
- David: fullstack, sabe React/Next.js, NestJS, Django, PostgreSQL, Docker
- Primera app móvil — preferir soluciones simples sobre elegantes
- Proyecto en fase MVP, evitar over-engineering
- Idioma de la app: español rioplatense
