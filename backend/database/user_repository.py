from pymongo import ASCENDING
from pymongo.collation import Collation
from pymongo.errors import DuplicateKeyError

from database.connection import db


users_collection = db["users"]
EMAIL_INDEX_NAME = "email_case_insensitive_unique"
EMAIL_COLLATION = Collation(locale="en", strength=2)


def ensure_user_indexes():
    users_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        collation=EMAIL_COLLATION,
        name=EMAIL_INDEX_NAME,
    )


def create_user(user_data: dict):
    """
    Insert a new user into the users collection.
    """
    try:
        result = users_collection.insert_one(user_data)
    except DuplicateKeyError as error:
        details = error.details or {}
        key_pattern = details.get("keyPattern", {})
        if "email" in key_pattern or EMAIL_INDEX_NAME in details.get("errmsg", ""):
            raise ValueError("Email is already registered") from error
        raise
    return result.inserted_id


def get_user_by_email(email: str):
    """
    Find a user using their email address.
    """
    return users_collection.find_one(
        {"email": email},
        collation=EMAIL_COLLATION,
    )


def get_user_by_researchflow_id(researchflow_id: str):
    """
    Find a user using their ResearchFlow ID.
    """
    return users_collection.find_one(
        {"researchflow_id": researchflow_id}
    )


def set_password_reset_token(email: str, token_hash: str, expires_at):
    """
    Save the hashed reset token and expiration on the user document.
    """
    return users_collection.update_one(
        {"email": email},
        {
            "$set": {
                "password_reset": {
                    "token_hash": token_hash,
                    "expires_at": expires_at,
                    "used": False,
                }
            }
        },
        collation=EMAIL_COLLATION,
    )


def get_user_by_reset_token_hash(token_hash: str):
    """
    Look up user by active password reset token hash.
    """
    return users_collection.find_one(
        {"password_reset.token_hash": token_hash}
    )


def update_user_password_and_clear_token(user_id, new_password_hash: str):
    """
    Update the user's password and invalidate the password reset token.
    """
    return users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "password_hash": new_password_hash,
                "password_reset.used": True,
            },
            "$unset": {
                "password_reset.token_hash": "",
            },
        },
    )
