import sys
import unittest
from pathlib import Path
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from services import google_auth_service
from api import auth as auth_api



class GoogleAuthTests(unittest.TestCase):
    def test_verify_google_credential_rejects_empty(self):
        with self.assertRaisesRegex(ValueError, "missing"):
            google_auth_service.verify_google_credential("")

    def test_verify_google_credential_rejects_unverified_email(self):
        fake_id_info = {
            "email": "user@example.com",
            "email_verified": False,
            "name": "Unverified User",
            "sub": "12345",
        }
        with patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_id_info):
            with self.assertRaisesRegex(ValueError, "not verified"):
                google_auth_service.verify_google_credential("fake-credential")

    def test_authenticate_existing_user_does_not_create_duplicate(self):
        fake_id_info = {
            "email": "existing@university.edu",
            "email_verified": True,
            "name": "Existing Scholar",
            "sub": "google-sub-123",
        }
        existing_user = {
            "name": "Existing Scholar",
            "email": "existing@university.edu",
            "researchflow_id": "RF-EX1234",
            "password_hash": "argon2hash",
        }
        with (
            patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_id_info),
            patch.object(google_auth_service, "get_user_by_email", return_value=existing_user),
            patch.object(google_auth_service, "create_user") as mock_create,
            patch.object(google_auth_service, "create_access_token", return_value="jwt-token-abc"),
        ):
            result = google_auth_service.authenticate_google_user("valid-credential")
            self.assertEqual(result["researchflow_id"], "RF-EX1234")
            self.assertEqual(result["access_token"], "jwt-token-abc")
            self.assertEqual(result["email"], "existing@university.edu")
            mock_create.assert_not_called()

    def test_authenticate_new_user_creates_account_with_unique_id(self):
        fake_id_info = {
            "email": "newuser@gmail.com",
            "email_verified": True,
            "name": "New Researcher",
            "sub": "google-sub-456",
        }
        with (
            patch("google.oauth2.id_token.verify_oauth2_token", return_value=fake_id_info),
            patch.object(google_auth_service, "get_user_by_email", return_value=None),
            patch.object(google_auth_service, "generate_researchflow_id", return_value="RF-NEW777"),
            patch.object(google_auth_service, "get_user_by_researchflow_id", return_value=None),
            patch.object(google_auth_service, "create_user") as mock_create,
            patch.object(google_auth_service, "create_access_token", return_value="jwt-token-new"),
        ):
            result = google_auth_service.authenticate_google_user("valid-credential")
            self.assertEqual(result["researchflow_id"], "RF-NEW777")
            self.assertEqual(result["name"], "New Researcher")
            self.assertEqual(result["email"], "newuser@gmail.com")
            self.assertEqual(result["access_token"], "jwt-token-new")
            mock_create.assert_called_once()
            created_data = mock_create.call_args[0][0]
            self.assertEqual(created_data["email"], "newuser@gmail.com")
            self.assertEqual(created_data["researchflow_id"], "RF-NEW777")
            self.assertEqual(created_data["google_id"], "google-sub-456")

    def test_google_auth_endpoint_returns_token_on_success(self):
        client = TestClient(app)
        auth_result = {
            "researchflow_id": "RF-STANFORD-1",
            "name": "Dr. Researcher",
            "email": "dr@stanford.edu",
            "access_token": "token-xyz",
            "token_type": "bearer",
        }
        with patch.object(auth_api, "authenticate_google_user", return_value=auth_result):
            response = client.post("/auth/google", json={"credential": "sample-credential"})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["researchflow_id"], "RF-STANFORD-1")
            self.assertEqual(response.json()["access_token"], "token-xyz")

    def test_google_auth_endpoint_returns_400_on_invalid_token(self):
        client = TestClient(app)
        with patch.object(auth_api, "authenticate_google_user", side_effect=ValueError("Invalid Google ID token")):
            response = client.post("/auth/google", json={"credential": "bad-credential"})
            self.assertEqual(response.status_code, 400)
            self.assertIn("Invalid Google ID token", response.json()["detail"])



if __name__ == "__main__":
    unittest.main()
