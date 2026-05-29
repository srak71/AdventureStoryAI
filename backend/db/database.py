"""
db/database.py
--------------
SQLAlchemy setup: engine, session factory, declarative base, and
FastAPI dependency helpers.

All ORM models should import `Base` from this module and call
`create_tables()` (or use Alembic migrations) to materialise their
schemas in the database.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator

from core.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

# `create_engine` establishes the connection pool.  Additional kwargs like
# `pool_size` or `connect_args` can be added here for production tuning.
engine = create_engine(settings.DATABASE_URL)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

# autocommit=False  → changes must be explicitly committed (safer default).
# autoflush=False   → prevents implicit flushes before every query, giving
#                     finer control over when SQL is emitted.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# Declarative base
# ---------------------------------------------------------------------------

# All ORM model classes inherit from `Base`.  SQLAlchemy uses it to track
# table metadata (column definitions, relationships, etc.).
Base = declarative_base()

# ---------------------------------------------------------------------------
# Dependency helpers
# ---------------------------------------------------------------------------

def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session for the duration of
    a single HTTP request and guarantees the session is closed afterwards.

    Usage in a route:
        @router.get("/items")
        def list_items(db: Session = Depends(get_db)):
            return db.query(Item).all()

    Yields
    ------
    Session
        An active SQLAlchemy session bound to the request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  # always close, even if an exception was raised


def create_tables() -> None:
    """
    Create all database tables that correspond to registered ORM models.

    This is a convenience helper for development / initial setup.  In
    production, prefer Alembic migrations for schema management.

    Note: models must be imported somewhere before this is called so that
    their metadata is registered on `Base`.
    """
    Base.metadata.create_all(bind=engine)

