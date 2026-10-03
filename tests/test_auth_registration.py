import sys
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from pymongo.errors import DuplicateKeyError

from database import user_repository
from services import auth_service


class UserEmailUniquenessTests(unittest.TestCase):
    def test_email_lookup_uses_case_insensitive_collation(self):
        email = "Test@example.com"
        with patch.object(user_repository.users_collection, "find_one", return_value=None) as find_one:
            user_repository.get_user_by_email(email)

        find_one.assert_called_once_with(
            {"email": email},
            collation=user_repository.EMAIL_COLLATION,
        )

    def test_user_index_is_unique_and_case_insensitive(self):
        with patch.object(user_repository.users_collection, "create_index") as create_index:
            user_repository.ensure_user_indexes()

        create_index.assert_called_once_with(
            [("email", user_repository.ASCENDING)],
            unique=True,
            collation=user_repository.EMAIL_COLLATION,
            name=user_repository.EMAIL_INDEX_NAME,
        )

    def test_duplicate_email_index_error_becomes_registration_error(self):
        duplicate_error = DuplicateKeyError(
            "duplicate email",
            details={"keyPattern": {"email": 1}},
        )
        with patch.object(user_repository.users_collection, "insert_one", side_effect=duplicate_error):
            with self.assertRaisesRegex(ValueError, "Email is already registered"):
                user_repository.create_user({"email": "test@example.com"})

    def test_existing_email_is_rejected_before_hashing_or_inserting(self):
        with (
            patch.object(auth_service, "get_user_by_email", return_value={"email": "test@example.com"}),
            patch.object(auth_service, "hash_password") as hash_password,
            patch.object(auth_service, "create_user") as create_user,
        ):
            with self.assertRaisesRegex(ValueError, "Email is already registered"):
                auth_service.register_user("Test User", "TEST@example.com", "password")

        hash_password.assert_not_called()
        create_user.assert_not_called()

    def test_new_email_still_registers_with_hashed_password(self):
        with (
            patch.object(auth_service, "get_user_by_email", return_value=None),
            patch.object(auth_service, "get_user_by_researchflow_id", return_value=None),
            patch.object(auth_service, "generate_researchflow_id", return_value="RF-test"),
            patch.object(auth_service, "hash_password", return_value="stored-hash") as hash_password,
            patch.object(auth_service, "create_user") as create_user,
        ):
            result = auth_service.register_user("Test User", "new@example.com", "secret")

        self.assertEqual(result["researchflow_id"], "RF-test")
        hash_password.assert_called_once_with("secret")
        self.assertEqual(create_user.call_args.args[0]["password_hash"], "stored-hash")


if __name__ == "__main__":
    unittest.main()