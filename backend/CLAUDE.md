# Backend MindLog — FastAPI

## Estructura de un endpoint
```python
# routes/entries.py
from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.database import get_db

router = APIRouter(prefix="/entries", tags=["entries"])

@router.get("/")
async def get_entries(
    db = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Query DB con el user_id del token
    # 2. Retornar { data, error }
    ...
```

## Servicio Claude
Toda llamada a Anthropic va en `services/claude.py`.

```python
import anthropic
from app.config import settings

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
# Modelo principal: claude-sonnet-4-6
# Modelo ligero (mood detection): claude-haiku-4-5-20251001
```

## Base de datos
- ORM: SQLAlchemy async con asyncpg
- DATABASE_URL debe ser postgresql+asyncpg:// (se convierte automáticamente)
- Las tablas se crean al iniciar con Base.metadata.create_all
- Para producción: usar Alembic para migraciones

## Variables de entorno requeridas (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@host:5432/mindlog
JWT_SECRET=clave-muy-secreta-aqui
JWT_ALGORITHM=HS256
```

## Respuesta estándar
Todos los endpoints retornan `{ "data": ..., "error": null }` o `{ "data": null, "error": "mensaje" }`
Los errores HTTP (401, 404, etc.) usan HTTPException directamente.
