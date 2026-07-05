from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "VDR AI Copilot"
    environment: str = "local"
    database_url: str = Field(default="postgresql+psycopg://vdr:vdr@postgres:5432/vdr_ai")
    jwt_secret: str = Field(default="change-me-in-development")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    qdrant_host: str = "qdrant"
    qdrant_port: int = 6333
    document_storage_dir: str = "/storage/documents"
    llm_provider: str = "groq"
    groq_api_key: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache
def get_settings() -> Settings:
    return Settings()
