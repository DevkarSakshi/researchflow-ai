from datetime import date

from agents.academic.analytics import AnalyticsAgent
from agents.academic.progress_tracker import ProgressTrackerAgent
from agents.academic.reminder import ReminderAgent
from agents.academic.workflow import AcademicWorkflow
from database import academic_repository


ALLOWED_TASK_STATUSES = {"pending", "in_progress", "completed", "blocked"}


def create_academic_workflow(
    researchflow_id: str,
    research_workflow_id: str,
    final_research_plan: dict,
    deadline: str,
) -> dict:
    generated = AcademicWorkflow().build_from_research_plan(
        final_research_plan,
        deadline,
    )
    plan = generated["plan"]
    project = academic_repository.create_academic_project(
        {
            "researchflow_id": researchflow_id,
            "research_workflow_id": research_workflow_id,
            "research_topic": generated["research_topic"],
            "deadline": deadline,
            "milestones": plan.get("milestones", []),
            "schedule_risk": plan.get("schedule_risk", False),
        },
        plan.get("tasks", []),
    )
    return get_academic_state(researchflow_id, project=project)


def get_academic_state(researchflow_id: str, project: dict | None = None) -> dict:
    project = project or academic_repository.get_latest_academic_project(researchflow_id)
    if not project:
        return {
            "project": None,
            "tasks": [],
            "milestones": [],
            "reminders": [],
            "progress": _empty_progress(),
            "analytics": _empty_analytics(),
        }

    tasks = academic_repository.get_project_tasks(researchflow_id, project["id"])
    milestones = project.get("milestones", [])
    today = date.today().isoformat()
    return {
        "project": project,
        "tasks": tasks,
        "milestones": milestones,
        "reminders": ReminderAgent().generate_reminders(tasks, today=today),
        "progress": ProgressTrackerAgent().calculate_progress(
            tasks,
            today=today,
            milestones=milestones,
        ),
        "analytics": AnalyticsAgent().generate_analytics(
            tasks,
            today=today,
            milestones=milestones,
        ),
    }


def create_academic_task(researchflow_id: str, task_data: dict) -> dict:
    project = academic_repository.get_latest_academic_project(researchflow_id)
    if not project:
        raise ValueError("Approve a research plan before creating academic tasks.")

    due_date = task_data.get("end_date") or task_data.get("dueDate")
    if not due_date:
        raise ValueError("Task due date is required.")
    try:
        date.fromisoformat(due_date)
    except ValueError as error:
        raise ValueError("Task due date must use YYYY-MM-DD format.") from error

    task = {
        "title": task_data["title"].strip(),
        "task": task_data["title"].strip(),
        "description": task_data.get("description", ""),
        "status": "pending",
        "priority": task_data.get("priority", "medium"),
        "type": task_data.get("type", "research_milestone"),
        "course_or_project": task_data.get("course_or_project") or task_data.get("courseOrProject") or project["research_topic"],
        "start_date": task_data.get("start_date") or date.today().isoformat(),
        "end_date": due_date,
        "dependencies": task_data.get("dependencies", []),
        "source_section": task_data.get("source_section", "student_added"),
        "reason": task_data.get("reason", "Added by the researcher."),
    }
    return academic_repository.add_project_task(
        researchflow_id,
        project["id"],
        task,
    )


def update_academic_task_status(
    researchflow_id: str,
    task_id: str,
    status: str | None = None,
    toggle: bool = False,
) -> dict:
    project = academic_repository.get_latest_academic_project(researchflow_id)
    if not project:
        raise ValueError("No approved academic project exists.")

    if toggle:
        current_task = next(
            (task for task in academic_repository.get_project_tasks(researchflow_id, project["id"]) if task["id"] == task_id),
            None,
        )
        if not current_task:
            raise ValueError("Academic task not found.")
        status = "pending" if current_task.get("status") == "completed" else "completed"

    if status not in ALLOWED_TASK_STATUSES:
        raise ValueError("Task status must be pending, in_progress, completed, or blocked.")
    updated = academic_repository.update_project_task_status(
        researchflow_id,
        project["id"],
        task_id,
        status,
    )
    if not updated:
        raise ValueError("Academic task not found.")
    return updated


def _empty_progress() -> dict:
    return {
        "total_tasks": 0,
        "completed_tasks": 0,
        "pending_tasks": 0,
        "in_progress_tasks": 0,
        "overdue_tasks": 0,
        "progress_percentage": 0,
        "current_task": None,
        "next_task": None,
        "remaining_tasks": 0,
        "completed_milestones": 0,
        "total_milestones": 0,
    }


def _empty_analytics() -> dict:
    return {
        "total_tasks": 0,
        "completed_tasks": 0,
        "pending_tasks": 0,
        "in_progress_tasks": 0,
        "overdue_tasks": 0,
        "completion_rate": 0,
        "overdue_rate": 0,
        "project_status": "not_started",
        "total_project_days": 0,
        "tasks_by_status": {},
        "tasks_by_priority": {},
        "completed_milestones": 0,
        "total_milestones": 0,
    }