from datetime import datetime, timezone
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from core.settings import settings
from database.user_repository import (
    create_user,
    get_user_by_email,
    get_user_by_researchflow_id,
)
from services.researchflow_id_service import generate_researchflow_id
from services.token_service import create_access_token


def verify_google_credential(credential: str) -> dict:
    """
    Validate the Google ID token (JWT) against Google's public certificates.
    Ensures:
    - Token signature is authentic
    - Audience matches configured GOOGLE_CLIENT_ID (if configured)
    - Token is not expired
    - Email is present and verified
    """
    if not credential or not credential.strip():
        raise ValueError("Google credential token is missing.")

    audience = settings.google_client_id.strip() if settings.google_client_id else None

    try:
        id_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            audience=audience,
        )
    except Exception as error:
        raise ValueError(f"Invalid Google ID token: {error}") from error

    email = id_info.get("email")
    if not email:
        raise ValueError("Google token does not contain an email address.")

    email_verified = id_info.get("email_verified", False)
    if not email_verified:
        raise ValueError("Google account email is not verified.")

    name = id_info.get("name") or email.split("@")[0]
    google_sub = id_info.get("sub")

    return {
        "email": email.strip(),
        "name": name.strip(),
        "google_id": google_sub,
    }


def authenticate_google_user(credential: str) -> dict:
    """
    Authenticate or register a user using their verified Google identity.

    Rules:
    - If user exists by email, sign them in (no duplicate account).
    - If user does not exist, create a new ResearchFlow account.
    - Return access_token and user info.
    """
    google_data = verify_google_credential(credential)
    email = google_data["email"]
    name = google_data["name"]
    google_id = google_data.get("google_id")

    user = get_user_by_email(email)

    if not user:
        # Generate unique ResearchFlow ID
        while True:
            researchflow_id = generate_researchflow_id()
            if not get_user_by_researchflow_id(researchflow_id):
                break

        user_data = {
            "name": name,
            "email": email,
            "researchflow_id": researchflow_id,
            "google_id": google_id,
            "created_at": datetime.now(timezone.utc),
            "auth_provider": "google",
        }
        create_user(user_data)
        user = user_data

    access_token = create_access_token(user["researchflow_id"])

    return {
        "researchflow_id": user["researchflow_id"],
        "name": user.get("name", name),
        "email": user.get("email", email),
        "access_token": access_token,
        "token_type": "bearer",
    }
