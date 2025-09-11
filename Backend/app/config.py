from pydantic import BaseSettings
from dotenv import load_dotenv
import os

# Cargar el archivo .env automáticamente
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mi API con FastAPI"
    DEBUG: bool = True

    DATABASE_URL: str = os.getenv("DATABASE_URL")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hora

    class Config:
        env_file = ".env"

# Instancia global que puede importarse en todo el proyecto
settings = Settings()
