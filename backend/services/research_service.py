from datetime import datetime, timezone
from database.research_repository import (
    create_research_workflow as save_research_workflow
)


def create_research_workflow(
    researchflow_id: str,
    research_problem: str
):
    """
    Create and store a research workflow for a student.
    """

    workflow_data = {
        "researchflow_id": researchflow_id,
        "research_problem": research_problem,
        "status": "started",
        "agents": [
            "Orchestrator",
            "Literature Agent",
            "Paper Intelligence Agent",
            "Comparison Agent",
            "Gap Agent",
            "Idea Agent",
            "Methodology Agent",
            "Citation Agent",
            "Reviewer Agent",
        ],
        "created_at": datetime.now(timezone.utc),
    }

    save_research_workflow(workflow_data)

    return {
        "research_problem": research_problem,
        "status": "started",
        "agents": workflow_data["agents"],
    }