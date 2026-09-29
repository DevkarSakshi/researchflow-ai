import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class PaperIntelligenceAgent:
    """
    Paper Intelligence Agent responsible for extracting
    structured research information from academic papers.
    """

    def analyze_paper(self, paper: dict) -> dict:
        """
        Analyze a research paper using Gemini and extract
        methodology, dataset, models, results, and key findings.
        """

        title = paper.get("title", "")
        authors = paper.get("authors", [])
        abstract = paper.get("abstract", "")

        prompt = f"""
You are the Paper Intelligence Agent of ResearchFlow AI.

Analyze the following academic research paper.

Title:
{title}

Authors:
{authors}

Abstract:
{abstract}

Extract:
- methodology
- dataset
- models_or_techniques
- results
- key_findings

Do not invent information.
If information is not available, use "Not available".

Return ONLY valid JSON.

Use exactly this structure:

{{
    "methodology": "...",
    "dataset": "...",
    "models_or_techniques": ["..."],
    "results": "...",
    "key_findings": ["..."]
}}
"""

        max_retries = 3

        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt,
                )

                response_text = response.text.strip()

                if response_text.startswith("```"):
                    response_text = response_text.replace(
                        "```json", ""
                    ).replace(
                        "```", ""
                    ).strip()

                analysis = json.loads(response_text)

                if isinstance(analysis, dict):
                    return analysis

                raise ValueError(
                    "Gemini response is not a dictionary"
                )

            except (errors.ServerError, errors.ClientError) as error:
                if attempt == max_retries - 1:
                    return {
                        "status": "temporarily_unavailable",
                        "methodology": "AI analysis temporarily unavailable.",
                        "dataset": "Not available",
                        "models_or_techniques": [],
                        "results": "Not available",
                        "key_findings": [],
                        "error": str(error),
                    }

                time.sleep(3)

            except (json.JSONDecodeError, ValueError):
                raise ValueError(
                    "Paper Intelligence Agent received an invalid JSON response"
                )