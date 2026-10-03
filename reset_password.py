from services.password_service import hash_password
from database.user_repository import get_user_by_email
from database.connection import db

email = "aishtokalwar@gmail.com"
new_password = "Research123!"

user = get_user_by_email(email)

if not user:
    print("User not found")
else:
    db["users"].update_one(
        {"email": email},
        {"$set": {"password_hash": hash_password(new_password)}}
    )
    print("Password reset successfully")