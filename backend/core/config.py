"""
core/config.py
--------------
Centralised application configuration.

Pydantic's BaseSettings reads values from environment variables (or a .env
file) and exposes them as a typed Python object. Any missing required field
(e.g. DATABASE_URL) will raise a validation error at startup rather than
failing silently later at runtime.

Usage:
    from core.config import settings
    print(settings.DATABASE_URL)
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    """
    Application settings, loaded from environment variables / .env file.

    Fields
    ------
    API_PREFIX : str
        URL prefix for all API routes (default "/api").
    DEBUG : bool
        Enables verbose logging and Uvicorn reload when True.
    DATABASE_URL : str
        Full SQLAlchemy-compatible connection string, e.g.
        "postgresql://user:pass@localhost/dbname".
    ALLOWED_ORIGINS : str
        Comma-separated list of origins permitted by CORS, e.g.
        "http://localhost:3000,https://myapp.com".
        Parsed into a list by the `parse_allowed_origins` validator.
    OPENAI_API_KEY : str
        Secret key for authenticating with the OpenAI API.
    """

    API_PREFIX: str = "/api"
    DEBUG: bool = False
    DATABASE_URL: str
    ALLOWED_ORIGINS: str
    OPENAI_API_KEY: str

    @field_validator("ALLOWED_ORIGINS")
    def parse_allowed_origins(cls, v: str) -> list[str]:
        """
        Convert the comma-separated ALLOWED_ORIGINS string into a list.

        Parameters
        ----------
        v : str
            Raw value from the environment variable.

        Returns
        -------
        list[str]
            Individual origin strings, or an empty list if the value is blank.
        """
        return v.split(",") if v else []

    class Config:
        env_file = ".env"           # load from .env in the working directory
        env_file_encoding = "utf-8"
        case_sensitive = True       # DATABASE_URL ≠ database_url


# Singleton instance imported throughout the app.
settings = Settings()