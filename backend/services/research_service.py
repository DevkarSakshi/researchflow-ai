from datetime import date, datetime, timezone

from agents.workflow import build_research_workflow
from database.paper_repository import store_uploaded_paper
from database.research_repository import (
    create_research_workflow as save_research_workflow,
    get_latest_workflow_by_user,
    get_workflows_by_user,
    get_user_workflow_by_id,
    update_research_workflow,
    update_approval_status,
)
from schemas.research import UploadedPDF
from services.pdf_ingestion_service import (
    MAX_TOTAL_PDF_SIZE_BYTES,
    PDFIngestionError,
    extract_uploaded_pdf,
)


class ResearchInputError(Exception):
    pass


def create_research_workflow(
    researchflow_id: str,
    research_problem: str,
    pdfs: list[UploadedPDF | dict],
):
    """
    Create and execute a research workflow.

    User may provide:
    - topic only
    - PDF(s) only
    - topic + PDF(s)
    """

    uploads = []
    for pdf in pdfs:
        if isinstance(pdf, UploadedPDF):
            uploads.append(pdf)
            continue
        payload = pdf.model_dump() if hasattr(pdf, "model_dump") else pdf
        uploads.append(UploadedPDF.model_validate(payload))
    if sum(upload.size_bytes for upload in uploads) > MAX_TOTAL_PDF_SIZE_BYTES:
        raise PDFIngestionError("Combined PDF uploads exceed the 20 MiB request limit.")
    extracted_pdfs = [extract_uploaded_pdf(upload) for upload in uploads]

    safe_pdfs = [
        {
            "filename": pdf["filename"],
            "content_type": pdf["content_type"],
            "size_bytes": pdf["size_bytes"],
            "page_count": pdf["page_count"],
            "metadata": pdf["metadata"],
        }
        for pdf in extracted_pdfs
    ]

    workflow_data = {
        "researchflow_id": researchflow_id,
        "research_problem": research_problem,
        "pdfs": safe_pdfs,
        "status": "started",
        "approval_status": "pending",
        "agent_statuses": {
            "orchestrator": "pending",
            "literature": "pending",
            "paper_intelligence": "pending",
            "comparison": "pending",
            "gap": "pending",
            "idea": "pending",
            "methodology": "pending",
            "citation": "pending",
            "reviewer": "pending",
            "final_plan": "pending",
        },
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
            "Final Research Plan Agent",
        ],
        "created_at": datetime.now(timezone.utc),
    }

    workflow_id = save_research_workflow(workflow_data)

    try:
        workflow_pdfs = []
        for pdf in extracted_pdfs:
            file_id = store_uploaded_paper(
                content=pdf["content"],
                filename=pdf["filename"],
                workflow_id=workflow_id,
                researchflow_id=researchflow_id,
            )
            reference = {
                key: value
                for key, value in pdf.items()
                if key not in {"content", "page_texts", "sections"}
            }
            reference["paper_id"] = file_id
            workflow_pdfs.append({
                **reference,
                **pdf["metadata"],
                "source_type": "uploaded_pdf",
                "sections": pdf["sections"],
                "page_texts": pdf["page_texts"],
            })

        safe_pdfs = [
            {
                key: value
                for key, value in paper.items()
                if key not in {"sections", "page_texts"}
            }
            for paper in workflow_pdfs
        ]
        update_research_workflow(workflow_id, {"pdfs": safe_pdfs})

        workflow = build_research_workflow(
            status_callback=lambda agent_id, status: update_research_workflow(
                workflow_id,
                {f"agent_statuses.{agent_id}": status},
            )
        )
        result = workflow.invoke({
            "research_problem": research_problem,
            "pdfs": workflow_pdfs,
            "agent_statuses": workflow_data["agent_statuses"],
        })

        output = {
            "workflow_id": str(workflow_id),
            "research_problem": research_problem,
            "pdfs": safe_pdfs,
            "status": "completed",
            "approval_status": "pending",
            "agents": workflow_data["agents"],
            "agent_statuses": result.get("agent_statuses", {}),
            "literature_sources": result.get("literature_sources", []),
            "tasks": result.get("tasks", []),
            "papers": result.get("papers", []),
            "paper_analysis": result.get("paper_analysis", []),
            "comparison": result.get("comparison", []),
            "research_gaps": result.get("research_gaps", []),
            "research_ideas": result.get("research_ideas", []),
            "methodology": result.get("methodology", {}),
            "citations": result.get("citations", []),
            "reviewer_feedback": result.get("reviewer_feedback", {}),
            "final_research_plan": result.get("final_research_plan", {}),
        }
        update_research_workflow(workflow_id, {
            "status": "completed",
            "result": output,
            "agent_statuses": output["agent_statuses"],
        })
        return output
    except Exception as error:
        update_research_workflow(workflow_id, {
            "status": "failed",
            "error": str(error),
        })
        raise

def update_research_approval(
    researchflow_id: str,
    approval_status: str,
    deadline: str | None = None,
    student_notes: str | None = None,
) -> dict:

    allowed_statuses = {
        "approved",
        "changes_requested",
        "rejected",
    }

    if approval_status not in allowed_statuses:
        raise ValueError("Invalid approval status")

    latest_workflow = get_latest_workflow_by_user(researchflow_id)
    if not latest_workflow or latest_workflow.get("status") != "completed":
        raise ValueError("A completed research workflow is required before approval.")

    workflow_result = latest_workflow.get("result") or {}
    if approval_status == "approved":
        if not workflow_result.get("final_research_plan"):
            raise ValueError("The final research plan has not completed.")
        if not workflow_result.get("paper_analysis"):
            raise ValueError("At least one analyzed paper is required before approval.")
        if not deadline:
            raise ValueError("Provide a project deadline before approving the plan.")
        try:
            deadline_date = date.fromisoformat(deadline)
        except ValueError as error:
            raise ValueError("Project deadline must use YYYY-MM-DD format.") from error
        if deadline_date < date.today():
            raise ValueError("Project deadline cannot be in the past.")

    updated = update_approval_status(
        researchflow_id,
        approval_status,
        {
            "deadline": deadline,
            "student_notes": student_notes,
        },
    )
    academic_state = None
    if approval_status == "approved":
        from services.academic_service import create_academic_workflow

        academic_state = create_academic_workflow(
            researchflow_id=researchflow_id,
            research_workflow_id=latest_workflow["id"],
            final_research_plan=workflow_result["final_research_plan"],
            deadline=deadline,
        )
    return {
        "workflow": updated,
        "academic": academic_state,
    }


def get_user_research_history(researchflow_id: str) -> list[dict]:
    """
    Retrieve all research workflows for a user formatted for research history.
    """
    workflows = get_workflows_by_user(researchflow_id)
    history = []
    for wf in workflows:
        result = wf.get("result") or {}
        paper_analysis = result.get("paper_analysis") or []
        pdfs = wf.get("pdfs") or []
        created_at_val = wf.get("created_at")
        created_at_iso = (
            created_at_val.isoformat()
            if hasattr(created_at_val, "isoformat")
            else str(created_at_val) if created_at_val else None
        )

        history.append({
            "id": wf.get("id") or str(wf.get("_id")),
            "research_problem": wf.get("research_problem") or "",
            "status": wf.get("status") or "pending",
            "approval_status": wf.get("approval_status") or "pending",
            "paper_count": len(paper_analysis) if paper_analysis else len(pdfs),
            "created_at": created_at_iso,
            "has_final_plan": bool(result.get("final_research_plan")),
        })
    return history


def get_user_workflow(researchflow_id: str, workflow_id: str) -> dict | None:
    """
    Retrieve a specific research workflow for a user with user isolation.
    """
    return get_user_workflow_by_id(researchflow_id, workflow_id)
