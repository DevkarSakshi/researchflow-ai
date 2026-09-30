import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class ComparisonAgent:
    """
    Comparison Agent responsible for comparing
    research papers using Paper Intelligence outputs.
    """

    def fallback_comparison(
        self,
        papers: list[dict],
        paper_analysis: list[dict]
    ) -> list[dict]:

        comparison = []

        for index, paper in enumerate(papers):

            analysis = (
                paper_analysis[index]
                if index < len(paper_analysis)
                else {}
            )

            comparison.append({
                "paperId": str(index + 1),

                "paperTitle": paper.get(
                    "title",
                    "Not available"
                ),

                "authors": paper.get(
                    "authors",
                    []
                ),

                "year": paper.get(
                    "year"
                ),

                "methodology": analysis.get(
                    "methodology",
                    "Not available"
                ),

                "dataset": analysis.get(
                    "dataset",
                    "Not available"
                ),

                "models_or_techniques": analysis.get(
                    "models_or_techniques",
                    []
                ),

                "results": analysis.get(
                    "results",
                    "Not available"
                ),

                "key_findings": analysis.get(
                    "key_findings",
                    []
                ),

                "limitations": analysis.get(
                    "limitations",
                    "Not available"
                ),

                "strengths": (
                    "Strengths are based only on "
                    "the available paper evidence."
                )
            })

        return comparison

    def compare_papers(
        self,
        papers: list[dict],
        paper_analysis: list[dict]
    ) -> list[dict]:

        print(">>> COMPARISON AGENT CALLED <<<")

        if not papers:
            return []

        paper_information = []

        for index, paper in enumerate(papers):

            analysis = (
                paper_analysis[index]
                if index < len(paper_analysis)
                else {}
            )

            paper_information.append({

                "paperId": str(index + 1),

                "title": paper.get(
                    "title",
                    "Not available"
                ),

                "authors": paper.get(
                    "authors",
                    []
                ),

                "year": paper.get(
                    "year"
                ),

                "methodology": analysis.get(
                    "methodology",
                    "Not available"
                ),

                "dataset": analysis.get(
                    "dataset",
                    "Not available"
                ),

                "models_or_techniques": analysis.get(
                    "models_or_techniques",
                    []
                ),

                "results": analysis.get(
                    "results",
                    "Not available"
                ),

                "key_findings": analysis.get(
                    "key_findings",
                    []
                ),

                "limitations": analysis.get(
                    "limitations",
                    "Not available"
                )
            })

        prompt = f"""
You are the Comparison Agent of ResearchFlow AI.

Compare the following academic research papers using
ONLY the evidence provided by the Paper Intelligence Agent.

IMPORTANT RULES:

1. Do NOT invent information.

2. Do NOT infer a limitation simply because information
   is missing.

3. Use the explicitly provided limitations field.

4. Preserve exact dataset names.

5. Preserve reported numerical results.

6. Preserve the exact methodology as much as possible.

7. Compare every paper individually.

8. Identify strengths only when supported by the
   provided evidence.

9. Do not create fake strengths.

10. Do not convert missing information into a research gap.

11. The number of comparison objects MUST exactly match
    the number of papers provided.

12. Return ONLY valid JSON.

Paper information:

{json.dumps(paper_information, indent=2)}

Return exactly:

{{
    "comparisons": [
        {{
            "paperId": "1",
            "paperTitle": "...",
            "authors": [],
            "year": 2026,
            "methodology": "...",
            "dataset": "...",
            "models_or_techniques": [],
            "results": "...",
            "key_findings": [],
            "limitations": "...",
            "strengths": "..."
        }}
    ]
}}
"""

        max_retries = 2

        for attempt in range(max_retries):

            try:

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt,
                )

                response_text = (
                    response.text.strip()
                )

                if response_text.startswith("```"):

                    response_text = (
                        response_text
                        .replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )

                result = json.loads(
                    response_text
                )

                if not isinstance(
                    result,
                    dict
                ):
                    raise ValueError(
                        "Gemini response is not a dictionary"
                    )

                comparisons = result.get(
                    "comparisons",
                    []
                )

                if not isinstance(
                    comparisons,
                    list
                ):
                    raise ValueError(
                        "Invalid comparison format"
                    )

                if len(comparisons) != len(
                    papers
                ):
                    raise ValueError(
                        "Gemini returned an incorrect "
                        "number of comparison rows"
                    )

                print(
                    ">>> GEMINI COMPARISON RESULT <<<"
                )

                print(
                    json.dumps(
                        comparisons,
                        indent=2
                    )
                )

                return comparisons

            except (
                errors.ServerError,
                errors.ClientError
            ):

                print(
                    ">>> GEMINI COMPARISON FAILED <<<"
                )

                if attempt == max_retries - 1:

                    return self.fallback_comparison(
                        papers,
                        paper_analysis
                    )

                time.sleep(2)

            except (
                json.JSONDecodeError,
                ValueError
            ):

                return self.fallback_comparison(
                    papers,
                    paper_analysis
                )