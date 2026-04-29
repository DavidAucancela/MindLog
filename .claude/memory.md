# Memoria del proyecto MindLog

## Decisiones técnicas
- Backend en FastAPI (no NestJS) porque David quiere explorar Python para IA
- Embeddings para MVP: búsqueda por recencia (no coseno) — simplicidad > precisión
- Para producción: integrar text-embedding-3-small de OpenAI + cálculo de coseno
- Auth: solo email/password por ahora, OAuth con Google viene después del MVP
- El chat NO persiste entre sesiones — cada conversación empieza limpia (privacidad)
- No hay modo offline en MVP — requiere conexión para chat y resúmenes

## Deuda técnica aceptada en MVP
- Embeddings no implementados (generate_embedding retorna None)
- find_relevant_entries usa solo las 5 más recientes, no similitud semántica
- No hay paginación en entradas (límite de 50)
- No hay edición de entradas (solo crear y borrar)
- Las tablas se crean con metadata.create_all (no Alembic)

## Hoja de ruta post-MVP
1. Embeddings reales con OpenAI + búsqueda por similitud coseno
2. Modo offline con SQLite local (expo-sqlite)
3. Gráfica de estado de ánimo en el tiempo
4. Export de entradas en PDF
5. OAuth con Google
6. Estadísticas emocionales

## Contexto del desarrollador
- David: fullstack (React, NestJS, Django, PostgreSQL, Docker), primera app móvil
- Mac M5, principal objetivo: aprender React Native en el proceso
- Prioridad: lanzar rápido, iterar después
