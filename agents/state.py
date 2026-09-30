from typing import TypedDict


class ResearchState(TypedDict, total=False):
    research_problem: str

    tasks: list[str]
    papers: list[dict]
    paper_analysis: list[dict]
    comparison: list[dict]

    research_gaps: list[dict]
    research_ideas: list[str]
    methodology: dict
    citations: list[dict]
    reviewer_feedback: str
    final_research_plan: dict

    approval_status: str

    # Actual agent execution status
    agent_status: dict[str, str]