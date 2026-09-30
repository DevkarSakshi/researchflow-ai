from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.research import ResearchApprovalRequest, ResearchRequest
from services.research_service import (
    ResearchInputError,
    create_research_workflow,
)
from services.pdf_ingestion_service import PDFIngestionError
from services import research_service
from database.research_repository import get_latest_workflow_by_user


router = APIRouter(
    prefix="/research",
    tags=["Research"]
)


@router.post("/start")
def start_research(
    request: ResearchRequest,
    researchflow_id: str = Depends(
        get_current_researchflow_id
    ),
):
    try:
        if not request.research_problem.strip() and not request.pdfs:
            raise HTTPException(
                status_code=400,
                detail="Provide a research topic or upload at least one PDF."
            )

        result = create_research_workflow(
            researchflow_id=researchflow_id,
            research_problem=request.research_problem.strip(),
            pdfs=request.pdfs,
        )

        return {
            "message": "Research workflow started",
            "workflow": result,
        }

    except HTTPException:
        raise

    except ResearchInputError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except PDFIngestionError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print(f"Research workflow error: {error}")

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.get("/latest")
def get_latest_research(
    researchflow_id: str = Depends(
        get_current_researchflow_id
    ),
):
    return {
        "workflow": get_latest_workflow_by_user(researchflow_id),
    }


@router.patch("/approval")
def update_research_approval(
    request: ResearchApprovalRequest,
    researchflow_id: str = Depends(
        get_current_researchflow_id
    ),
):
    try:
        return research_service.update_research_approval(
            researchflow_id,
            request.approval_status,
            request.deadline.isoformat() if request.deadline else None,
            request.student_notes,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )