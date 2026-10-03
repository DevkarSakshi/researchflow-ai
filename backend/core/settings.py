import os

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        ".env",
    )
)


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

    password_reset_token_expire_minutes: int = int(
        os.getenv("PASSWORD_RESET_TOKEN_EXPIRE_MINUTES", "15")
    )

    frontend_base_url: str = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173"
    )

    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "no-reply@researchflow.ai")

    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")


settings = Settings()
