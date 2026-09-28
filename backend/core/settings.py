import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()


class Settings(BaseModel):
    mongodb_url: str = os.getenv(
        "MONGODB_URL",
        "mongodb://localhost:27017"
    )
    database_name: str = os.getenv(
        "DATABASE_NAME",
        "researchflow"
    )
    jwt_secret_key: str = os.getenv(
        "JWT_SECRET_KEY",
        "change-this-secret-key"
    )
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60


settings = Settings()