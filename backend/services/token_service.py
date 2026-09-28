from datetime import datetime, timedelta, timezone

import jwt

from core.settings import settings


def create_access_token(researchflow_id: str) -> str:
    expire_time = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )

    payload = {
        "sub": researchflow_id,
        "exp": expire_time,
    }

    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

def verify_access_token(token: str) -> str:
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        researchflow_id = payload.get("sub")

        if not researchflow_id:
            raise ValueError("Invalid token")

        return researchflow_id

    except jwt.PyJWTError:
        raise ValueError("Invalid or expired token")