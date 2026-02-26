from typing import List, Union, Any
from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Snag"
    API_V1_STR: str = "/api/v1"

    # Database — must be set in .env
    DATABASE_URL: str = "sqlite+aiosqlite:///./snag.db"

    # Redis — defaults to 'redis' for Docker, 'localhost' for local dev
    REDIS_URL: str = "redis://redis:6379/0"

    # AI Provider — set in .env
    AI_PROVIDER: str = "zai"
    AI_API_KEY: str = ""          # required in .env
    AI_MODEL: str = "glm-4.5-flash"
    AI_ENDPOINT: str = "https://api.z.ai/api/paas/v4"

    # Security — set in .env
    SECRET_KEY: str = ""          # required in .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # CORS — Defaults to allow common dev ports, plus production domain
    BACKEND_CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000", 
        "http://localhost:3001",
        "https://snag.dploy.lol"
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> Any:
        if isinstance(v, str):
            # Si es un string que empieza con "[", es JSON
            if v.startswith("["):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    return v
            # Si contiene comas, es una lista separada por comas
            elif "," in v:
                return [i.strip() for i in v.split(",")]
            # Si es "*", permitir todos los orígenes
            elif v == "*":
                return ["*"]
            # Si es un solo origen
            else:
                return [v.strip()]
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"


settings = Settings()
