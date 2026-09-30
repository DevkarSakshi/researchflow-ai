from datetime import datetime, timezone
from uuid import uuid4

from database.connection import db


academic_project_collection = db["academic_projects"]
academic_task_collection = db["academic_tasks"]


def create_academic_project(project: dict, tasks: list[dict]) -> dict:
    existing = academic_project_collection.find_one({
        "researchflow_id": project["researchflow_id"],
        "research_workflow_id": project["research_workflow_id"],
    })
    if existing:
        return _clean(existing)

    project_id = uuid4().hex
    document = {
        **project,
        "_id": project_id,
        "created_at": datetime.now(timezone.utc),
        "milestones": project.get("milestones", []),
    }
    academic_project_collection.insert_one(document)

    task_documents = [
        {
            **task,
            "_id": task.get("id") or uuid4().hex,
            "project_id": project_id,
            "researchflow_id": project["researchflow_id"],
            "research_workflow_id": project["research_workflow_id"],
            "created_at": datetime.now(timezone.utc),
        }
        for task in tasks
    ]
    if task_documents:
        academic_task_collection.insert_many(task_documents)
    document["task_count"] = len(task_documents)
    academic_project_collection.update_one(
        {"_id": project_id},
        {"$set": {"task_count": len(task_documents)}},
    )
    return _clean(document)


def get_latest_academic_project(researchflow_id: str) -> dict | None:
    project = academic_project_collection.find_one(
        {"researchflow_id": researchflow_id},
        sort=[("created_at", -1)],
    )
    return _clean(project) if project else None


def get_project_tasks(researchflow_id: str, project_id: str) -> list[dict]:
    tasks = academic_task_collection.find(
        {"researchflow_id": researchflow_id, "project_id": project_id}
    ).sort([("start_date", 1), ("end_date", 1)])
    return [_clean(task) for task in tasks]


def add_project_task(researchflow_id: str, project_id: str, task: dict) -> dict:
    document = {
        **task,
        "_id": uuid4().hex,
        "project_id": project_id,
        "researchflow_id": researchflow_id,
        "created_at": datetime.now(timezone.utc),
    }
    academic_task_collection.insert_one(document)
    return _clean(document)


def update_project_task_status(
    researchflow_id: str,
    project_id: str,
    task_id: str,
    status: str,
) -> dict | None:
    result = academic_task_collection.find_one_and_update(
        {
            "_id": task_id,
            "project_id": project_id,
            "researchflow_id": researchflow_id,
        },
        {
            "$set": {
                "status": status,
                "updated_at": datetime.now(timezone.utc),
            }
        },
        return_document=True,
    )
    return _clean(result) if result else None


def _clean(document: dict) -> dict:
    cleaned = dict(document)
    cleaned["id"] = str(cleaned.pop("_id", cleaned.get("id", "")))
    cleaned.pop("created_at", None)
    cleaned.pop("updated_at", None)
    return cleaned