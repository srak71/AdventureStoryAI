from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
)

# Bind session to engine
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Connect to db session, ensure that only one session is used per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

 # Create all tables based on the models defined in the app
def create_tables():
    Base.metadata.create_all(bind=engine)

