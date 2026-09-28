import secrets
import string


def generate_researchflow_id() -> str:
    """
    Generate a unique-looking ResearchFlow ID.

    Example:
    RF-7K4P92
    """

    characters = string.ascii_uppercase + string.digits

    random_part = "".join(
        secrets.choice(characters)
        for _ in range(6)
    )

    return f"RF-{random_part}"