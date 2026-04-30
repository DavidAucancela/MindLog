from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, entries, chat, summary, stats


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="MindLog API", version="1.0.0", lifespan=lifespan, redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(entries.router)
app.include_router(chat.router)
app.include_router(summary.router)
app.include_router(stats.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MindLog API"}
