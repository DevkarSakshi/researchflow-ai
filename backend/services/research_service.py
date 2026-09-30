from datetime import datetime, timezone

from agents.workflow import build_research_workflow
from database.research_repository import (
    create_research_workflow as save_research_workflow
)


def create_research_workflow(
    researchflow_id: str,
    research_problem: str
):
    """
    Create and execute a complete research workflow.
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

    # Save workflow start information
    save_research_workflow(workflow_data)

    # Build and execute the 9-agent LangGraph workflow
    workflow = build_research_workflow()

    initial_state = {
        "research_problem": research_problem
    }

    result = workflow.invoke(initial_state)

    return {
        "research_problem": research_problem,
        "status": "completed",
        "agents": workflow_data["agents"],
        "tasks": result.get("tasks", []),
        "papers": result.get("papers", []),
        "paper_analysis": result.get("paper_analysis", []),
        "comparison": result.get("comparison", []),
        "research_gaps": result.get("research_gaps", []),
        "research_ideas": result.get("research_ideas", []),
        "methodology": result.get("methodology", {}),
        "citations": result.get("citations", []),
        "reviewer_feedback": result.get("reviewer_feedback", ""),
        "final_research_plan": result.get(
            "final_research_plan", {}
        ),
    }


def update_research_approval(
    researchflow_id: str,
    approval_status: str
) -> dict:
    """
    Update the approval status of a research workflow.
    """

    allowed_statuses = {
        "pending",
        "approved",
        "changes_requested",
        "rejected"
    }

    if approval_status not in allowed_statuses:
        raise ValueError("Invalid approval status")

    result = research_repository.update_approval_status(
        researchflow_id,
        approval_status
    )

    return result