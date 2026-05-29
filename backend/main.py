"""
main.py
-------
Application entry point. Creates the FastAPI app instance, registers
middleware, and (when run directly) starts the Uvicorn development server.

Routers for individual feature areas (stories, jobs, etc.) should be
imported and mounted here via `app.include_router(...)`.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Adventure Story API",
    description="An API for generating adventure stories using AI.",
    version="0.1.0",
    docs_url="/docs",      # Swagger UI  → http://localhost:8000/docs
    redoc_url="/redoc",    # ReDoc UI    → http://localhost:8000/redoc
)

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

# Allow cross-origin requests from the origins listed in .env (ALLOWED_ORIGINS).
# allow_credentials=True is required when the frontend sends cookies or
# Authorization headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],   # permit all HTTP methods (GET, POST, PUT, DELETE…)
    allow_headers=["*"],   # permit all request headers
)

# ---------------------------------------------------------------------------
# Dev server entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    # Run with hot-reload enabled for local development.
    # In production, start uvicorn externally (e.g. `uvicorn main:app`).
    uvicorn.run(
        "main:app",
        host="0.0.0.0",  # listen on all interfaces
        port=8000,
        reload=True,     # restart on source-file changes
    )
    
    