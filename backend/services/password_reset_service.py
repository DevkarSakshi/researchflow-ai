from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from core.settings import settings
from database.user_repository import (
    get_user_by_email,
    get_user_by_reset_token_hash,
    set_password_reset_token,
    update_user_password_and_clear_token,
)
from services.email_service import send_password_reset_email
from services.password_service import hash_password


def hash_reset_token(token: str) -> str:
    """
    Produce a deterministic SHA-256 hash of the random reset token.
    The database only ever stores this hash, preventing token leaks.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def request_password_reset(email: str) -> dict:
    """
    Generate a secure single-use password reset token if account exists.
    Always returns a generic response to prevent account enumeration.
    """
    user = get_user_by_email(email)

    if user:
        raw_token = secrets.token_urlsafe(32)
        token_hash = hash_reset_token(raw_token)

        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=settings.password_reset_token_expire_minutes
        )

        set_password_reset_token(
            email=user["email"],
            token_hash=token_hash,
            expires_at=expires_at,
        )

        reset_link = f"{settings.frontend_base_url.rstrip('/')}/reset-password?token={raw_token}"
        send_password_reset_email(user["email"], reset_link)

    # Generic security response: never reveal whether account exists
    return {
        "message": "If an account exists for this email, you will receive a password reset link."
    }


def verify_reset_token(raw_token: str) -> dict:
    """
    Verify if a raw token is valid and unexpired without consuming it.
    """
    if not raw_token or not raw_token.strip():
        raise ValueError("Invalid reset token")

    token_hash = hash_reset_token(raw_token.strip())
    user = get_user_by_reset_token_hash(token_hash)

    if not user:
        raise ValueError("Invalid or expired reset token")

    reset_info = user.get("password_reset", {})

    if reset_info.get("used"):
        raise ValueError("Reset token has already been used")

    expires_at = reset_info.get("expires_at")
    if not expires_at:
        raise ValueError("Invalid reset token")

    # Handle timezone-aware and naive datetime representations from MongoDB
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        now_cmp = datetime.now(timezone.utc).replace(tzinfo=None)
    else:
        now_cmp = now

    if expires_at < now_cmp:
        raise ValueError("Reset token has expired")

    return {
        "valid": True,
        "email_hint": user.get("email", ""),
    }


def reset_password_with_token(raw_token: str, new_password: str) -> dict:
    """
    Reset user password using valid token and invalidate token immediately.
    """
    if not new_password or len(new_password) < 6:
        raise ValueError("Password must be at least 6 characters long")

    # Verify token
    verify_reset_token(raw_token)

    token_hash = hash_reset_token(raw_token.strip())
    user = get_user_by_reset_token_hash(token_hash)

    if not user:
        raise ValueError("Invalid or expired reset token")

    # Hash new password using existing Argon2 / pwdlib password_service
    new_password_hash = hash_password(new_password)

    # Atomically update password and invalidate the token
    update_user_password_and_clear_token(user["_id"], new_password_hash)

    return {
        "message": "Password has been successfully reset. You can now log in with your new password.",
        "researchflow_id": user.get("researchflow_id", ""),
    }
