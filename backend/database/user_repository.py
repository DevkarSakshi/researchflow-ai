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