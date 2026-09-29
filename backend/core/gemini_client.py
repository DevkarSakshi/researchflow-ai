from google import genai

from backend.core.settings import settings


client = genai.Client(
    api_key=settings.gemini_api_key
)