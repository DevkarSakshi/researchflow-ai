from datetime import datetime, timezone

from database.user_repository import (
    create_user,
    get_user_by_email,
    get_user_by_researchflow_id,
)
from services.password_service import hash_password
from services.researchflow_id_service import generate_researchflow_id


def register_user(name: str, email: str, password: str):
    # Check whether email is already registered
    existing_user = get_user_by_email(email)

    if existing_user:
        raise ValueError("Email is already registered")

    # Generate a ResearchFlow ID that is not already in use
    while True:
        researchflow_id = generate_researchflow_id()

        existing_id = get_user_by_researchflow_id(
            researchflow_id
        )

        if not existing_id:
            break

    # Hash the password before storing it
    password_hash = hash_password(password)

    # Create user document
    user_data = {
        "name": name,
        "email": email,
        "researchflow_id": researchflow_id,
        "password_hash": password_hash,
        "created_at": datetime.now(timezone.utc),
    }

    # Save user in MongoDB
    create_user(user_data)

    return {
        "name": name,
        "email": email,
        "researchflow_id": researchflow_id,
    }