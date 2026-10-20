
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.routes.incidents import router
from app.routes.departments import router as departments_router


# Resolve the backend directory.
# This file is located at backend/app/main.py.
BACKEND_DIR = Path(__file__).resolve().parent.parent

# Use one consistent directory for uploaded images.
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI app
app = FastAPI(
    title="ARIIP Backend",
    version="1.0.0"
)


# Serve uploaded images at http://127.0.0.1:8000/uploads/<filename>
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routes
app.include_router(router)
app.include_router(departments_router)


@app.get("/")
def root():
    return {
        "status": "running",
        "message": "ARIIP Backend Running"
    }


@app.get("/health")
def health():
    return {
        "healthy": True
    }
