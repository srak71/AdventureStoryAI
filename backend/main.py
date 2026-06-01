"""
main.py
-------
Application entry point. Creates the FastAPI app instance, registers
middleware, and (when run directly) starts the Uvicorn development server.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from db.database import create_tables
from routers import story, job

app = FastAPI(
    title="Adventure Story API",
    description="An API for generating adventure stories using AI.",
    version="0.1.0",
)

# Parse ALLOWED_ORIGINS: "*" or empty = allow all; otherwise split by comma
_origins_raw = settings.ALLOWED_ORIGINS.strip() if isinstance(settings.ALLOWED_ORIGINS, str) else ""
if not _origins_raw or _origins_raw == "*":
    _allow_origins = ["*"]
else:
    _allow_origins = [o.strip() for o in _origins_raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(story.router, prefix=settings.API_PREFIX)
app.include_router(job.router, prefix=settings.API_PREFIX)

try:
    create_tables()
except Exception as e:
    import sys
    print(f"Warning: create_tables() failed on startup: {e}", file=sys.stderr)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
