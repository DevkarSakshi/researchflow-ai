import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))


class Settings(BaseModel):
    mongodb_url: str = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017"
    )
    database_name: str = os.getenv(
        "DATABASE_NAME",
        "researchflow"
    )
    gemini_api_key: str = os.getenv(
    "GEMINI_API_KEY",
    ""
    )
    jwt_secret_key: str = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-key"
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()