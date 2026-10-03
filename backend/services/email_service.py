import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from core.settings import settings

logger = logging.getLogger("researchflow.email")

# In-memory storage for test/dev inspection of reset links
_dev_last_reset_link: Optional[str] = None


def is_smtp_configured() -> bool:
    """
    Check if SMTP credentials and host are fully configured.
    """
    return bool(settings.smtp_host and settings.smtp_user and settings.smtp_password)


def build_reset_email_messages(reset_link: str) -> tuple[str, str]:
    """
    Build professional plain-text and HTML versions of the password reset email.
    """
    text_content = (
        "ResearchFlow AI\n\n"
        "We received a request to reset your password.\n\n"
        f"Reset Password: {reset_link}\n\n"
        f"This link expires in {settings.password_reset_token_expire_minutes} minutes and can only be used once.\n\n"
        "If you didn't request a password reset, you can safely ignore this email.\n\n"
        "— The ResearchFlow AI Team\n"
    )

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset your ResearchFlow AI password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0b0f19; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 36px 32px;" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="padding-bottom: 24px; text-align: left;">
              <span style="font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                ResearchFlow <span style="font-size: 11px; background-color: rgba(59, 130, 246, 0.2); color: #60a5fa; padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.4); text-transform: uppercase; font-family: monospace;">AI</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="font-size: 15px; line-height: 24px; color: #cbd5e1; padding-bottom: 24px;">
              We received a request to reset your password.
            </td>
          </tr>
          <tr>
            <td align="left" style="padding-bottom: 28px;">
              <a href="{reset_link}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-weight: 600; font-size: 14px; line-height: 14px; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                Reset Password
              </a>
            </td>
          </tr>
          <tr>
            <td style="font-size: 13px; line-height: 20px; color: #94a3b8; padding-bottom: 16px; border-top: 1px solid #1e293b; padding-top: 20px;">
              This link expires in <strong>{settings.password_reset_token_expire_minutes} minutes</strong> and can only be used once.
            </td>
          </tr>
          <tr>
            <td style="font-size: 12px; line-height: 18px; color: #64748b;">
              If you didn't request a password reset, you can safely ignore this email.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    return text_content, html_content


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    """
    Send a password reset email using Gmail / standard SMTP with TLS on port 587.
    Never logs credentials or passwords.
    Raises RuntimeError if SMTP is not configured or fails.
    """
    global _dev_last_reset_link
    _dev_last_reset_link = reset_link

    if not is_smtp_configured():
        logger.error(
            "SMTP is not configured. Missing SMTP_HOST, SMTP_USER, or SMTP_PASSWORD in environment."
        )
        raise RuntimeError("Email service is not configured on the server.")

    subject = "Reset your ResearchFlow AI password"
    text_content, html_content = build_reset_email_messages(reset_link)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    from_addr = settings.smtp_from_email or settings.smtp_user
    msg["From"] = from_addr
    msg["To"] = to_email

    msg.attach(MIMEText(text_content, "plain", "utf-8"))
    msg.attach(MIMEText(html_content, "html", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(from_addr, [to_email], msg.as_string())

        logger.info("Password reset email successfully dispatched to recipient via SMTP.")
        return True
    except Exception as error:
        # Never log credentials or SMTP password in exception messages
        logger.error("Failed to send password reset email via SMTP host %s: %s", settings.smtp_host, type(error).__name__)
        raise RuntimeError("Failed to deliver password reset email.") from error


def get_dev_last_reset_link() -> Optional[str]:
    """
    Helper for local test verification without querying external mailboxes.
    """
    return _dev_last_reset_link


def clear_dev_last_reset_link() -> None:
    global _dev_last_reset_link
    _dev_last_reset_link = None
