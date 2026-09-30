from typing import TypedDict


class ResearchState(TypedDict, total=False):

    research_problem: str

    pdfs: list[dict]

    tasks: list[str]

    papers: list[dict]

    literature_sources: list[dict]

    paper_analysis: list[dict]

    comparison: list[dict]

    research_gaps: list[dict]

    research_ideas: list[dict]

    methodology: dict

    citations: list[dict]

    reviewer_feedback: dict

    final_research_plan: dict

    academic_plan: dict

    approval_status: str

    agent_statuses: dict[str, str]