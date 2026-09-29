from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.research import ResearchApprovalRequest, ResearchRequest
from services.research_service import create_research_workflow
from services import research_service


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
        return research_service.update_research_approval(
            researchflow_id,
            request.approval_status
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )