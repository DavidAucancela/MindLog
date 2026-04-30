# Memoria del proyecto MindLog

## Decisiones técnicas
- Backend en FastAPI (no NestJS) porque David quiere explorar Python para IA
- Embeddings: text-embedding-3-small de OpenAI + coseno en Python (numpy). Requiere OPENAI_API_KEY; sin ella degradación graceful a recencia
- Chat busca en las últimas 200 entradas para la similitud semántica
- Auth: solo email/password por ahora, OAuth con Google viene después del MVP
- El historial del chat NO persiste entre sesiones — solo se guarda el contexto destilado del usuario (privacidad)
- No hay modo offline en MVP — requiere conexión para chat y resúmenes
- Migraciones: Alembic configurado con async engine (env.py + versions/)

## Perfil de usuario — decisión de diseño (2026-04-30)
- `users.context` (Text, nullable): documento de viñetas cortas que acumula lo que la IA sabe del usuario
- Se actualiza al cerrar cada conversación via `POST /chat/close`
- Claude Haiku extrae y fusiona el perfil nuevo (máx 250 palabras) para mantener costo bajo
- Se inyecta en el system prompt de `/chat/stream` como bloque "Lo que sé de esta persona:"
- El historial de la conversación NO se persiste — solo el contexto destilado

## Deuda técnica resuelta
- ✅ Embeddings reales con OpenAI text-embedding-3-small (2026-04-29)
- ✅ find_relevant_entries usa similitud coseno con numpy (2026-04-29)
- ✅ PATCH /entries/{id} — edición de contenido y mood (2026-04-29)
- ✅ Alembic configurado (001_initial_schema.py como baseline) (2026-04-29)
- ✅ Perfil de usuario acumulativo con cierre de conversación (2026-04-30)

## Deuda técnica pendiente
- No hay paginación en entradas del chat (límite 200, suficiente por ahora)
- Entradas antiguas (sin embedding) no aparecen en búsqueda semántica
- No hay pantalla para que el usuario vea/edite su `context` acumulado

## Hoja de ruta post-MVP
1. ✅ Embeddings reales con OpenAI + búsqueda semántica (hecho)
2. ✅ Edición de entradas (hecho)
3. ✅ Alembic para migraciones (hecho)
4. ✅ Perfil de usuario acumulativo + cierre de conversación (hecho)
5. Resumen diario visible en la UI (el endpoint existe, falta UI)
6. Pantalla "Lo que sé de vos" para ver/editar el contexto del usuario
7. Gráfica de estado de ánimo en el tiempo (en perfil)
8. Modo offline con SQLite local (expo-sqlite)
9. Export de entradas en PDF
10. OAuth con Google

## Migraciones Alembic
```bash
cd backend
# BD nueva (sin tablas previas):
.venv/bin/alembic upgrade head

# BD existente (creada con create_all antes de Alembic):
.venv/bin/alembic stamp 001
.venv/bin/alembic upgrade head

# Nueva migración:
.venv/bin/alembic revision --autogenerate -m "descripcion"
```

Migraciones:
- 001_initial_schema — tablas users + entries
- 002_add_user_context — columna context en users

## Contexto del desarrollador
- David: fullstack (React, NestJS, Django, PostgreSQL, Docker), primera app móvil
- Mac M5, principal objetivo: aprender React Native en el proceso
- Prioridad: lanzar rápido, iterar después
