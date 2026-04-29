# MindLog — Contexto del proyecto

## Qué es esto
App móvil de diario personal con IA. El usuario escribe entradas libres y puede
conversar con ellas mediante Claude API. FastAPI backend + Expo mobile.

Este directorio (mi-app) es el proyecto Expo. El backend FastAPI está en backend/.

## Stack
- Mobile: Expo SDK 54, React Native, Expo Router (file-based routing), TypeScript
- Backend: FastAPI, SQLAlchemy async, PostgreSQL (Supabase), pgvector
- IA: Claude API (claude-sonnet-4-6) via Anthropic SDK Python
- Auth: JWT con python-jose
- Estado: Zustand + TanStack Query
- Deploy: Railway (backend), Expo EAS (mobile)

## Estructura del proyecto
```
mi-app/                    ← este directorio = raíz = app mobile
├── app/
│   ├── (auth)/            ← login, register (sin tabs)
│   └── (tabs)/            ← pantallas principales (requieren login)
├── api/client.ts          ← cliente HTTP centralizado
├── store/                 ← Zustand stores
├── components/            ← componentes reutilizables
└── backend/               ← FastAPI server
    └── app/
        ├── routes/        ← endpoints por feature
        ├── services/      ← lógica de IA (Claude, embeddings)
        └── models/        ← SQLAlchemy models
```

## Convenciones
- Python: snake_case. TypeScript: camelCase. Componentes RN: PascalCase.
- Cada endpoint FastAPI va en su propio archivo en routes/
- Los servicios de IA van en services/ — nunca lógica de Claude directamente en routes
- Todas las respuestas de la API tienen forma: `{ data, error }`
- Variables de entorno: nunca hardcodeadas, siempre desde .env / EXPO_PUBLIC_

## Paleta de diseño
- Fondo: #FAF7F2 (blanco cálido)
- Texto: #2C2C2C
- Acento: #8B7355 (marrón cálido)
- Secundario: #C4A882
- Input bg: #F5F0E8
- Bordes: #E8E0D5

## Lo que NO hacer
- No uses expo-cli global, usa `npx expo`
- No uses class components en React Native, solo functional
- No pongas lógica de negocio en los componentes, va en el store o en api/
- No hagas llamadas directas a Claude API desde el mobile, siempre pasa por el backend
- No uses colores brillantes — este es un diario, el tono es íntimo y cálido

## Comandos útiles
```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Mobile
npx expo start --ios

# Instalar deps mobile
npx expo install zustand @tanstack/react-query expo-secure-store
```

## Dev actual
- David: fullstack, sabe React/Next.js, NestJS, Django, PostgreSQL, Docker
- Primera app móvil — preferir soluciones simples sobre elegantes
- Proyecto en fase MVP, evitar over-engineering
