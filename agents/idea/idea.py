import json
import time

from google.genai import errors

from backend.core.gemini_client import client


class IdeaAgent:
    """
    Idea Agent generates research directions from
    scientifically defensible research gaps.
    """

    def generate_ideas(
        self,
        research_problem: str,
        research_gaps: list[dict]
    ) -> list[dict]:

        if not research_gaps:
            return []

        valid_gaps = []

        for gap in research_gaps[:5]:

            title = str(
                gap.get(
                    "title",
                    ""
                )
            ).strip()

            if not title:
                continue

            if (
                title.lower()
                == "insufficient evidence for a confirmed gap"
            ):
                continue

            valid_gaps.append(gap)

        if not valid_gaps:
            return []

        prompt = f"""
You are the Idea Agent of ResearchFlow AI.

Generate practical and research-worthy research ideas
from the scientifically defensible research gaps below.

Research problem:

{research_problem}

Research gaps:

{json.dumps(valid_gaps, indent=2)}

IMPORTANT RULES:

1. Every idea MUST directly address one specific
   research gap.

2. Do NOT generate generic ideas such as:
   "AI-Based Approach for Research Gap".

3. Propose a specific technical research direction.

4. Use only technologies and approaches that are
   reasonably relevant to the identified gap.

5. Do not invent experimental results.

6. Do not claim that the proposed approach is already
   proven.

7. The idea should be realistic for an academic
   research project.

8. Include a clear hypothesis.

9. Include a practical architecture/pipeline.

10. Include an estimated effort of 8-16 weeks.

11. Return at most 5 ideas.

12. Return ONLY valid JSON.

Return exactly:

{{
    "ideas": [
        {{
            "title": "Specific research idea",
            "core_hypothesis": "Testable research hypothesis",
            "rationale": "Why this idea addresses the research gap",
            "architecture": "Step-by-step technical pipeline",
            "effort_weeks": "8-16",
            "target": "Research problem",
            "source_gap": "Research gap addressed"
        }}
    ]
}}
"""

        for attempt in range(2):

            try:

                print(">>> IDEA AGENT CALLED <<<")

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
                        "Invalid idea response"
                    )

                ideas = result.get(
                    "ideas",
                    []
                )

                if not isinstance(
                    ideas,
                    list
                ):
                    raise ValueError(
                        "Invalid ideas format"
                    )

                valid_ideas = []

                for idea in ideas[:5]:

                    if not isinstance(
                        idea,
                        dict
                    ):
                        continue

                    title = str(
                        idea.get(
                            "title",
                            ""
                        )
                    ).strip()

                    if not title:
                        continue

                    valid_ideas.append({
                        "title": title,

                        "core_hypothesis": str(
                            idea.get(
                                "core_hypothesis",
                                ""
                            )
                        ).strip(),

                        "rationale": str(
                            idea.get(
                                "rationale",
                                ""
                            )
                        ).strip(),

                        "architecture": str(
                            idea.get(
                                "architecture",
                                ""
                            )
                        ).strip(),

                        "effort_weeks": str(
                            idea.get(
                                "effort_weeks",
                                "8-16"
                            )
                        ).strip(),

                        "target": research_problem,

                        "source_gap": str(
                            idea.get(
                                "source_gap",
                                ""
                            )
                        ).strip()
                    })

                return valid_ideas

            except (
                errors.ServerError,
                errors.ClientError
            ):

                print(
                    ">>> GEMINI IDEA GENERATION FAILED <<<"
                )

                if attempt == 1:
                    return self.fallback_ideas(
                        research_problem,
                        valid_gaps
                    )

                time.sleep(2)

            except (
                json.JSONDecodeError,
                ValueError
            ):

                print(
                    ">>> INVALID GEMINI IDEA RESPONSE <<<"
                )

                return self.fallback_ideas(
                    research_problem,
                    valid_gaps
                )

        return self.fallback_ideas(
            research_problem,
            valid_gaps
        )

    def fallback_ideas(
        self,
        research_problem: str,
        research_gaps: list[dict]
    ) -> list[dict]:

        """
        Conservative fallback.

        Does not invent an idea when no defensible gap
        exists.
        """

        ideas = []

        for gap in research_gaps[:5]:

            title = gap.get(
                "title",
                ""
            )

            description = gap.get(
                "description",
                ""
            )

            if not title:
                continue

            ideas.append({
                "title": (
                    f"Research Framework to Address: "
                    f"{title}"
                ),

                "core_hypothesis": (
                    f"A targeted research approach addressing "
                    f"{title} may improve the identified limitation."
                ),

                "rationale": description,

                "architecture": (
                    "Data Collection → Preprocessing → "
                    "Baseline Model → Proposed Approach → "
                    "Evaluation → Comparative Analysis"
                ),

                "effort_weeks": "8-16",

                "target": research_problem,

                "source_gap": title
            })

        return ideas[:5]