from datetime import datetime, timedelta, timezone
from email import message_from_string
import hashlib
from pathlib import Path
import smtplib
import sys
import unittest
from unittest.mock import patch, MagicMock

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from core.settings import settings
from services import password_reset_service, email_service, password_service


class PasswordResetTests(unittest.TestCase):
    def setUp(self):
        email_service.clear_dev_last_reset_link()

    def test_existing_registered_email_triggers_smtp_send(self):
        mock_user = {
            "_id": "user123",
            "email": "student@university.edu",
            "name": "Jane Researcher",
            "researchflow_id": "RF-STANFORD-101",
        }

        with (
            patch.object(password_reset_service, "get_user_by_email", return_value=mock_user),
            patch.object(password_reset_service, "set_password_reset_token") as mock_set_token,
            patch.object(email_service, "is_smtp_configured", return_value=True),
            patch("smtplib.SMTP") as mock_smtp_class,
        ):
            mock_server = MagicMock()
            mock_smtp_class.return_value.__enter__.return_value = mock_server

            response = password_reset_service.request_password_reset("student@university.edu")

            self.assertEqual(
                response["message"],
                "If an account exists for this email, you will receive a password reset link."
            )
            mock_set_token.assert_called_once()
            mock_server.starttls.assert_called_once()
            mock_server.login.assert_called_once()
            mock_server.sendmail.assert_called_once()

    def test_email_contains_correct_reset_url_and_raw_token_while_mongo_stores_hash(self):
        mock_user = {
            "_id": "user123",
            "email": "student@university.edu",
            "name": "Jane Researcher",
            "researchflow_id": "RF-STANFORD-101",
        }

        with (
            patch.object(password_reset_service, "get_user_by_email", return_value=mock_user),
            patch.object(password_reset_service, "set_password_reset_token") as mock_set_token,
            patch.object(email_service, "is_smtp_configured", return_value=True),
            patch("smtplib.SMTP") as mock_smtp_class,
        ):
            mock_server = MagicMock()
            mock_smtp_class.return_value.__enter__.return_value = mock_server

            password_reset_service.request_password_reset("student@university.edu")

            # Verify token stored in DB is SHA-256 hash (64 chars hex)
            call_kwargs = mock_set_token.call_args.kwargs
            stored_token_hash = call_kwargs["token_hash"]
            self.assertEqual(len(stored_token_hash), 64)

            # Verify email sent contains the raw URL with token parameter
            sendmail_call = mock_server.sendmail.call_args
            to_addr = sendmail_call.args[1]
            raw_msg_str = sendmail_call.args[2]

            self.assertEqual(to_addr, ["student@university.edu"])
            parsed_msg = message_from_string(raw_msg_str)
            self.assertEqual(parsed_msg["Subject"], "Reset your ResearchFlow AI password")

            # Extract email payload text
            payloads = [part.get_payload(decode=True).decode("utf-8") for part in parsed_msg.get_payload()]
            combined_email_text = " ".join(payloads)

            expected_base = settings.frontend_base_url.rstrip("/") + "/reset-password?token="
            self.assertIn(expected_base, combined_email_text)
            self.assertIn("Reset Password", combined_email_text)
            self.assertIn("expires in 15 minutes", combined_email_text)

            # Ensure the raw token from the email hashes to the token_hash stored in MongoDB
            import re
            match = re.search(r"/reset-password\?token=([a-zA-Z0-9_\-]+)", combined_email_text)
            self.assertIsNotNone(match)
            raw_token_in_email = match.group(1)
            self.assertEqual(hashlib.sha256(raw_token_in_email.encode("utf-8")).hexdigest(), stored_token_hash)
            # The raw token itself is NOT what was stored
            self.assertNotEqual(raw_token_in_email, stored_token_hash)

    def test_nonexistent_email_sends_no_email_and_preserves_generic_response(self):
        with (
            patch.object(password_reset_service, "get_user_by_email", return_value=None),
            patch.object(password_reset_service, "set_password_reset_token") as mock_set_token,
            patch.object(password_reset_service, "send_password_reset_email") as mock_send_email,
        ):
            response = password_reset_service.request_password_reset("unknown@university.edu")

            mock_set_token.assert_not_called()
            mock_send_email.assert_not_called()
            self.assertEqual(
                response["message"],
                "If an account exists for this email, you will receive a password reset link."
            )

    def test_smtp_failure_is_handled_safely_and_raises_error(self):
        mock_user = {
            "_id": "user123",
            "email": "student@university.edu",
        }

        with (
            patch.object(password_reset_service, "get_user_by_email", return_value=mock_user),
            patch.object(password_reset_service, "set_password_reset_token"),
            patch.object(email_service, "is_smtp_configured", return_value=True),
            patch("smtplib.SMTP", side_effect=smtplib.SMTPAuthenticationError(535, b"Authentication failed")),
        ):
            with self.assertRaises(RuntimeError) as ctx:
                password_reset_service.request_password_reset("student@university.edu")
            self.assertIn("Failed to deliver password reset email", str(ctx.exception))

    def test_unconfigured_smtp_raises_error_during_reset_request(self):
        mock_user = {
            "_id": "user123",
            "email": "student@university.edu",
        }

        with (
            patch.object(password_reset_service, "get_user_by_email", return_value=mock_user),
            patch.object(password_reset_service, "set_password_reset_token"),
            patch.object(email_service, "is_smtp_configured", return_value=False),
        ):
            with self.assertRaises(RuntimeError) as ctx:
                password_reset_service.request_password_reset("student@university.edu")
            self.assertIn("Email service is not configured", str(ctx.exception))

    def test_valid_token_allows_password_reset_and_hashes_password(self):
        raw_token = "secure_random_token_12345"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        mock_user = {
            "_id": "user123",
            "email": "jane@university.edu",
            "researchflow_id": "RF-STANFORD-101",
            "password_reset": {
                "token_hash": token_hash,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=15),
                "used": False,
            }
        }

        with (
            patch.object(password_reset_service, "get_user_by_reset_token_hash", return_value=mock_user),
            patch.object(password_reset_service, "update_user_password_and_clear_token") as mock_update,
        ):
            result = password_reset_service.reset_password_with_token(raw_token, "brandNewSecretPassword123")

            self.assertIn("successfully reset", result["message"])
            self.assertEqual(result["researchflow_id"], "RF-STANFORD-101")
            mock_update.assert_called_once()
            user_id_arg, new_hash_arg = mock_update.call_args.args
            self.assertEqual(user_id_arg, "user123")
            # Verify new password was hashed using Argon2 password_service verify
            self.assertTrue(password_service.verify_password("brandNewSecretPassword123", new_hash_arg))
            # Verify old password is not matched by new hash
            self.assertFalse(password_service.verify_password("oldPassword", new_hash_arg))

    def test_expired_token_is_rejected(self):
        raw_token = "expired_token_xyz"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        mock_user = {
            "_id": "user123",
            "email": "jane@university.edu",
            "password_reset": {
                "token_hash": token_hash,
                "expires_at": datetime.now(timezone.utc) - timedelta(minutes=1),
                "used": False,
            }
        }

        with patch.object(password_reset_service, "get_user_by_reset_token_hash", return_value=mock_user):
            with self.assertRaisesRegex(ValueError, "Reset token has expired"):
                password_reset_service.reset_password_with_token(raw_token, "newPassword123")

    def test_token_cannot_be_reused(self):
        raw_token = "already_used_token_abc"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

        mock_user = {
            "_id": "user123",
            "email": "jane@university.edu",
            "password_reset": {
                "token_hash": token_hash,
                "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
                "used": True,
            }
        }

        with patch.object(password_reset_service, "get_user_by_reset_token_hash", return_value=mock_user):
            with self.assertRaisesRegex(ValueError, "already been used"):
                password_reset_service.reset_password_with_token(raw_token, "newPassword123")


if __name__ == "__main__":
    unittest.main()
