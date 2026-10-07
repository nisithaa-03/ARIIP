from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from sqlalchemy import inspect, text

from app.database import engine, Base
from app.routes.incidents import router
from app.routes.departments import router as departments_router

# Create database tables
Base.metadata.create_all(bind=engine)
if "address" not in {column["name"] for column in inspect(engine).get_columns("incidents")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE incidents ADD COLUMN address VARCHAR"))

# Create FastAPI app FIRST
app = FastAPI(
    title="ARIIP Backend",
    version="1.0.0"
)

BASE_DIR = Path(__file__).resolve().parent.parent

app.mount(
    "/uploads",
    StaticFiles(directory=BASE_DIR / "uploads"),
    name="uploads"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
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