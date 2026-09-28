from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.research import ResearchRequest
from services.research_service import create_research_workflow


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