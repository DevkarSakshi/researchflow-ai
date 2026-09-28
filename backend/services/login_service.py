from database.user_repository import get_user_by_researchflow_id
from services.password_service import verify_password
from services.token_service import create_access_token


def login_user(researchflow_id: str, password: str):
    # Find user by ResearchFlow ID
    user = get_user_by_researchflow_id(researchflow_id)

    if not user:
        raise ValueError("Invalid ResearchFlow ID or password")

    # Verify entered password against stored hash
    password_is_valid = verify_password(
        password,
        user["password_hash"],
    )

    if not password_is_valid:
        raise ValueError("Invalid ResearchFlow ID or password")

    # Create JWT access token
    access_token = create_access_token(
        user["researchflow_id"]
    )

    return {
        "researchflow_id": user["researchflow_id"],
        "name": user["name"],
        "access_token": access_token,
        "token_type": "bearer",
    }