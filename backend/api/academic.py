from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from core.security import get_current_researchflow_id
from schemas.academic import (
    AcademicStateResponse,
    AcademicTaskCreate,
    AcademicTaskResponse,
    AcademicTaskStatusUpdate,
)
from services import academic_service


router = APIRouter(prefix="/academic", tags=["Academic Workflow"])


@router.get("/state", response_model=AcademicStateResponse)
def get_academic_state(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)


@router.get("/tasks", response_model=list[AcademicTaskResponse])
def get_academic_tasks(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)["tasks"]


@router.post("/tasks", response_model=AcademicTaskResponse, status_code=201)
def create_academic_task(
    request: AcademicTaskCreate,
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    try:
        payload = request.model_dump(mode="json", by_alias=False)
        payload["end_date"] = payload.pop("due_date")
        return academic_service.create_academic_task(researchflow_id, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@router.patch("/tasks/{task_id}", response_model=AcademicTaskResponse)
def update_academic_task(
    task_id: str,
    request: AcademicTaskStatusUpdate,
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    try:
        return academic_service.update_academic_task_status(
            researchflow_id,
            task_id,
            request.status,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.patch("/tasks/{task_id}/toggle", response_model=AcademicTaskResponse)
def toggle_academic_task(
    task_id: str,
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    try:
        return academic_service.update_academic_task_status(
            researchflow_id,
            task_id,
            toggle=True,
        )
    except ValueError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.get("/deadlines")
def get_academic_deadlines(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    tasks = academic_service.get_academic_state(researchflow_id)["tasks"]
    today = date.today()
    return [
        {
            "id": task["id"],
            "title": task["title"],
            "dueDate": task["end_date"],
            "course": task.get("course_or_project") or "Research project",
            "daysRemaining": (date.fromisoformat(task["end_date"]) - today).days,
            "urgent": (date.fromisoformat(task["end_date"]) - today).days <= 3,
            "type": "milestone",
        }
        for task in tasks
        if task.get("status") not in {"completed", "done"}
    ]


@router.get("/agents")
def get_academic_agents(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    state = academic_service.get_academic_state(researchflow_id)
    project_exists = state["project"] is not None
    configured_agents = [
        ("planner", "Planner Agent", "Schedules tasks from an approved research plan."),
        ("progress_tracker", "Progress Tracker Agent", "Calculates status from persisted tasks."),
        ("reminder", "Reminder Agent", "Identifies overdue and upcoming task dates."),
        ("analytics", "Analytics Agent", "Derives project metrics from persisted tasks."),
    ]
    return [
        {
            "id": agent_id,
            "name": name,
            "role": role,
            "status": "completed" if project_exists else "pending",
            "lastSync": "Current request" if project_exists else "Not run",
            "insights": [
                f"{len(state['tasks'])} persisted tasks" if project_exists else "No approved research project yet."
            ],
        }
        for agent_id, name, role in configured_agents
    ]


@router.get("/progress")
def get_academic_progress(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)["progress"]


@router.get("/reminders")
def get_academic_reminders(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)["reminders"]


@router.get("/analytics")
def get_academic_analytics(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)["analytics"]


@router.get("/milestones")
def get_academic_milestones(
    researchflow_id: str = Depends(get_current_researchflow_id),
):
    return academic_service.get_academic_state(researchflow_id)["milestones"]