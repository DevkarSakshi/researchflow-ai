from typing import TypedDict


class ResearchState(TypedDict, total=False):

    research_problem: str

    tasks: list[str]

    papers: list[dict]

    paper_analysis: list[dict]

    comparison: list[dict]

    research_gaps: list[str]

    research_ideas: list[str]

    methodology: dict

    citations: list[dict]

    reviewer_feedback: str

    final_research_plan: dict

    academic_plan: dict

    approval_status: str