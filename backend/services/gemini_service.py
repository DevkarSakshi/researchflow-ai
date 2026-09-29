from core.gemini_client import client


def generate_text(prompt: str) -> str:
    """
    Generate a text response using Gemini.
    """

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=prompt,
    )

    return response.text