from datetime import datetime, timezone

from agents.workflow import build_research_workflow
from database import research_repository

from database.research_repository import (
    create_research_workflow as save_research_workflow,
    get_latest_workflow_by_user
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

    

    # Build and execute the 9-agent LangGraph workflow
    workflow = build_research_workflow()

    initial_state = {
        "research_problem": research_problem
    }

    result = workflow.invoke(initial_state)
    save_research_workflow({
    **workflow_data,
    "status": "completed",
    "tasks": result.get("tasks", []),
    "papers": result.get("papers", []),
    "paper_analysis": result.get("paper_analysis", []),
    "comparison": result.get("comparison", []),
    "research_gaps": result.get("research_gaps", []),
    "research_ideas": result.get("research_ideas", []),
    "methodology": result.get("methodology", {}),
    "citations": result.get("citations", []),
    "reviewer_feedback": result.get("reviewer_feedback", ""),
    "final_research_plan": result.get("final_research_plan", {}),
})

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

def get_latest_research_workflow(researchflow_id: str):
    """
    Get the latest research workflow for a student.
    """
    return get_latest_workflow_by_user(researchflow_id)

def get_research_papers_with_analysis(researchflow_id: str):
    """
    Return literature papers combined with their Paper Intelligence analysis.
    """
    workflow = get_latest_workflow_by_user(researchflow_id)

    if workflow is None:
        return None

    papers = workflow.get("papers", [])
    analyses = workflow.get("paper_analysis", [])

    combined_papers = []

    for index, paper in enumerate(papers):
        analysis = analyses[index] if index < len(analyses) else {}

        combined_papers.append({
            **paper,
            "pdfUrl": paper.get("url"),
            "summary": paper.get("abstract") or "Not available",
            "methodology": analysis.get(
                "methodology",
                "Not analyzed"
            ),
            "dataset": analysis.get(
                "dataset",
                "Not analyzed"
            ),
            "models_or_techniques": analysis.get(
                "models_or_techniques",
                []
            ),
            "results": analysis.get(
                "results",
                "Not analyzed"
            ),
            "key_findings": analysis.get(
                "key_findings",
                []
            ),
            "tags": analysis.get(
                "models_or_techniques",
                []
            ),
            "relevanceScore": 0,
        })

    return combined_papers