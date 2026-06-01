from typing import Optional
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    API_PREFIX: str = "/api"
    DEBUG: bool = False

    # Accept a full DATABASE_URL directly (e.g. from Neon / Vercel env vars),
    # or fall back to constructing it from individual DB_* vars when DEBUG=False.
    DATABASE_URL: Optional[str] = None

    # Comma-separated origins or "*". Parsed into a list in main.py.
    ALLOWED_ORIGINS: str = "*"

    OPENAI_API_KEY: str

    def __init__(self, **values):
        super().__init__(**values)
        if not self.DATABASE_URL:
            if self.DEBUG:
                self.DATABASE_URL = "sqlite:///./database.db"
            else:
                db_user = os.getenv("DB_USER")
                db_password = os.getenv("DB_PASSWORD")
                db_host = os.getenv("DB_HOST")
                db_port = os.getenv("DB_PORT", "5432")
                db_name = os.getenv("DB_NAME")
                self.DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
