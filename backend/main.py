from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

load_dotenv()

from app.core.database import engine, Base
from app.core.scheduler import start_scheduler, scheduler
from app.routers import auth, desks
from app.models import user, desk, booking  # ensure models are registered

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Start the background sweep job
    start_scheduler()
    yield
    # Shutdown
    scheduler.shutdown()

app = FastAPI(title="DeskGuard API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(desks.router)

@app.get("/")
async def root():
    return {"message": "DeskGuard API is running"}

@app.get("/health")
async def health():
    return {"status": "ok"}
