from database.connection import db


users_collection = db["users"]


def create_user(user_data: dict):
    """
    Insert a new user into the users collection.
    """
    result = users_collection.insert_one(user_data)
    return result.inserted_id


def get_user_by_email(email: str):
    """
    Find a user using their email address.
    """
    return users_collection.find_one({"email": email})


def get_user_by_researchflow_id(researchflow_id: str):
    """
    Find a user using their ResearchFlow ID.
    """
    return users_collection.find_one(
        {"researchflow_id": researchflow_id}
    )