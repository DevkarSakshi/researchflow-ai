import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class GapAgent:
    """
    Gap Agent identifies scientifically defensible research gaps
    from evidence extracted from academic papers.
    """

    def identify_gaps(
        self,
        papers: list[dict],
        comparison: list[dict]
    ) -> list[dict]:

        if not papers and not comparison:
            return []

        paper_information = []

        total_items = max(
            len(papers),
            len(comparison)
        )

        for index in range(total_items):

            paper = (
                papers[index]
                if index < len(papers)
                else {}
            )

            comparison_item = (
                comparison[index]
                if index < len(comparison)
                else {}
            )

            paper_information.append({
                "paperId": str(index + 1),

                "paperTitle": paper.get(
                    "title",
                    comparison_item.get(
                        "paperTitle",
                        f"Paper {index + 1}"
                    )
                ),

                "abstract": paper.get(
                    "abstract",
                    "Not available"
                ),

                "year": paper.get(
                    "year",
                    "Not available"
                ),

                "methodology": comparison_item.get(
                    "methodology",
                    "Not available"
                ),

                "dataset": comparison_item.get(
                    "dataset",
                    "Not available"
                ),

                "models_or_techniques":
                    comparison_item.get(
                        "models_or_techniques",
                        []
                    ),

                "results": comparison_item.get(
                    "results",
                    "Not available"
                ),

                "key_findings": comparison_item.get(
                    "key_findings",
                    []
                ),

                "limitations": comparison_item.get(
                    "limitations",
                    "Not available"
                )
            })

        prompt = f"""
You are the Gap Agent of ResearchFlow AI.

Your task is to identify REAL, SCIENTIFICALLY DEFENSIBLE
research gaps from the provided academic literature.

Use ONLY the evidence provided.

IMPORTANT RULES:

1. Identify gaps from patterns, limitations, weaknesses,
   and differences across the papers.

2. A missing metadata field is NOT a research gap.

3. NEVER create:
   - Dataset Information Gap
   - Results Information Gap
   - Abstract Information Gap
   - Metadata Information Gap
   - Missing Information Gap

4. Do not treat "Not available" as evidence of a
   scientific limitation.

5. Use the explicitly reported limitations as evidence.

6. A valid research gap should describe something that
   existing research has not adequately addressed.

7. Examples of legitimate gaps include:
   - lack of external validation
   - poor cross-dataset generalization
   - limited robustness testing
   - insufficient explainability
   - limited multimodal approaches
   - lack of longitudinal evaluation
   - limited real-world or clinical validation
   - class imbalance not adequately addressed
   - limited comparison between competing approaches
   - high computational cost
   - limited scalability
   - lack of diverse populations or environments
   - insufficient evaluation under noisy conditions
   - unexplored combinations of established methods

8. Do NOT claim that a gap exists unless the supplied
   evidence supports it.

9. Do not invent experiments, datasets, results,
   limitations, or claims.

10. Prefer gaps supported by multiple papers.

11. If only one paper supports a gap, clearly make the
    description specific to that paper.

12. Do not turn a limitation into a research gap unless
    it represents an unresolved research problem.

13. Return at most 5 gaps.

14. impactScore and feasibilityScore must be integers
    from 1 to 10 and must be based only on the supplied
    evidence.

15. Return ONLY valid JSON.

ACADEMIC LITERATURE:

{json.dumps(paper_information, indent=2)}

Return exactly:

{{
    "gaps": [
        {{
            "id": "GAP-1",
            "title": "Specific scientific research gap",
            "description": "Evidence-based explanation of why this remains unresolved.",
            "impactScore": 7,
            "feasibilityScore": 8,
            "sourcePaperTitles": [
                "Paper title"
            ]
        }}
    ]
}}

If no scientifically defensible gap can be established,
return:

{{
    "gaps": []
}}
"""

        for attempt in range(2):

            try:

                print(">>> GAP AGENT CALLED <<<")

                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt,
                )

                response_text = response.text.strip()

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
                        "Invalid gap response"
                    )

                gaps = result.get(
                    "gaps",
                    []
                )

                if not isinstance(
                    gaps,
                    list
                ):
                    raise ValueError(
                        "Invalid gaps format"
                    )

                valid_gaps = []

                forbidden_titles = {
                    "dataset information gap",
                    "results information gap",
                    "abstract information gap",
                    "metadata information gap",
                    "missing information gap",
                    "evaluation information gap"
                }

                forbidden_phrases = [
                    "dataset information is not available",
                    "results information is not available",
                    "abstract information is not available",
                    "metadata is not available",
                    "information is not available"
                ]

                for gap in gaps:

                    if not isinstance(
                        gap,
                        dict
                    ):
                        continue

                    title = str(
                        gap.get(
                            "title",
                            ""
                        )
                    ).strip()

                    description = str(
                        gap.get(
                            "description",
                            ""
                        )
                    ).strip()

                    title_lower = title.lower()
                    description_lower = (
                        description.lower()
                    )

                    if not title or not description:
                        continue

                    if title_lower in forbidden_titles:
                        continue

                    if any(
                        phrase in description_lower
                        for phrase in forbidden_phrases
                    ):
                        continue

                    source_titles = gap.get(
                        "sourcePaperTitles",
                        []
                    )

                    if not isinstance(
                        source_titles,
                        list
                    ):
                        source_titles = []

                    valid_gaps.append({
                        "id": gap.get(
                            "id",
                            f"GAP-{len(valid_gaps) + 1}"
                        ),

                        "title": title,

                        "description": description,

                        "impactScore": self.safe_score(
                            gap.get(
                                "impactScore",
                                5
                            )
                        ),

                        "feasibilityScore":
                            self.safe_score(
                                gap.get(
                                    "feasibilityScore",
                                    5
                                )
                            ),

                        "sourcePaperTitles":
                            source_titles[:5]
                    })

                return valid_gaps[:5]

            except (
                errors.ServerError,
                errors.ClientError
            ):

                print(
                    ">>> GEMINI GAP ANALYSIS FAILED <<<"
                )

                if attempt == 1:
                    return self.fallback_gaps(
                        papers,
                        comparison
                    )

                time.sleep(2)

            except (
                json.JSONDecodeError,
                ValueError
            ):

                print(
                    ">>> INVALID GEMINI GAP RESPONSE <<<"
                )

                return self.fallback_gaps(
                    papers,
                    comparison
                )

        return self.fallback_gaps(
            papers,
            comparison
        )

    def safe_score(
        self,
        value
    ) -> int:
        """
        Keep Gemini scores inside 1-10.
        """

        try:
            value = int(value)
        except (
            TypeError,
            ValueError
        ):
            value = 5

        return max(
            1,
            min(
                10,
                value
            )
        )

    def fallback_gaps(
        self,
        papers: list[dict],
        comparison: list[dict]
    ) -> list[dict]:

        """
        Safe fallback.

        Never invent a scientific research gap.
        """

        combined_titles = []

        for paper in papers:

            title = paper.get(
                "title"
            )

            if (
                title
                and title not in combined_titles
            ):
                combined_titles.append(
                    title
                )

        for item in comparison:

            title = item.get(
                "paperTitle"
            )

            if (
                title
                and title not in combined_titles
            ):
                combined_titles.append(
                    title
                )

        if not combined_titles:
            return []

        return [
            {
                "id": "GAP-1",

                "title":
                    "Insufficient Evidence for a Confirmed Gap",

                "description": (
                    "The available paper evidence does not "
                    "provide enough support to establish a "
                    "specific scientific research gap. "
                    "Additional full-text evidence or "
                    "broader literature analysis is required "
                    "before proposing a defensible gap."
                ),

                "impactScore": 5,

                "feasibilityScore": 5,

                "sourcePaperTitles":
                    combined_titles[:5]
            }
        ]