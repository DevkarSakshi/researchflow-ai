from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.research import ResearchApprovalRequest, ResearchRequest
from services.research_service import create_research_workflow
from services import research_service
from agents.workflow import AGENT_STATUS


router = APIRouter(prefix="/research", tags=["Research"])


@router.post("/start")
def start_research(
    request: ResearchRequest,
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    try:
        result = create_research_workflow(
            researchflow_id=researchflow_id,
            research_problem=request.research_problem,
        )

        return {
            "message": "Research workflow started",
            "workflow": result,
        }

    except Exception as error:
        print(f"Research workflow error: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.patch("/approval")
def update_research_approval(
    request: ResearchApprovalRequest,
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    try:
        updated_plan = research_service.update_research_approval(
            researchflow_id,
            request.approval_status
        )

        return {
            "success": True,
            "updatedPlan": updated_plan
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


@router.get("/latest")
def get_latest_research_workflow(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    workflow.pop("_id", None)

    return workflow


@router.get("/papers")
def get_research_papers(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    papers = research_service.get_research_papers_with_analysis(
        researchflow_id
    )

    if papers is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return papers


@router.get("/comparison")
def get_research_comparison(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return workflow.get("comparison", [])


@router.get("/gaps")
def get_research_gaps(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return {
        "research_gaps": workflow.get(
            "research_gaps",
            []
        ),
        "research_ideas": workflow.get(
            "research_ideas",
            []
        )
    }


@router.get("/methodology")
def get_research_methodology(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return workflow.get(
        "methodology",
        {}
    )


@router.get("/citations")
def get_research_citations(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return workflow.get(
        "citations",
        []
    )


@router.get("/reviewer")
def get_reviewer_feedback(
    researchflow_id: str = Depends(get_current_researchflow_id)
):
    workflow = research_service.get_latest_research_workflow(
        researchflow_id
    )

    if workflow is None:
        raise HTTPException(
            status_code=404,
            detail="No research workflow found"
        )

    return {
        "reviewer_feedback": workflow.get(
            "reviewer_feedback",
            ""
        )
    }

@router.get("/agent-status")
def get_agent_status():
    return {
        "agent_status": AGENT_STATUS
    }

