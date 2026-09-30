from pymongo import ReturnDocument

from database.connection import db


research_collection = db["research_workflows"]


def create_research_workflow(workflow_data: dict):
    """
    Store a research workflow in MongoDB.
    """
    result = research_collection.insert_one(workflow_data)
    return result.inserted_id


def update_research_workflow(workflow_id, fields: dict):
    """Update the persisted status and result of a research workflow."""
    research_collection.update_one(
        {"_id": workflow_id},
        {"$set": fields},
    )


def get_latest_workflow_by_user(researchflow_id: str):
    """Return the most recently created workflow for a student."""
    workflow = research_collection.find_one(
        {"researchflow_id": researchflow_id},
        sort=[("created_at", -1)],
    )
    if workflow is not None:
        workflow["id"] = str(workflow["_id"])
        workflow["_id"] = str(workflow["_id"])
    return workflow


def get_workflows_by_user(researchflow_id: str):
    """
    Get all research workflows belonging to a student.
    """
    return list(
        research_collection.find(
            {"researchflow_id": researchflow_id}
        )
    )


def get_workflow_by_id(workflow_id):
    """
    Get a research workflow using its MongoDB ID.
    """
    return research_collection.find_one(
        {"_id": workflow_id}
    )


def update_approval_status(
    researchflow_id: str,
    approval_status: str,
    fields: dict | None = None,
) -> dict:
    """
    Update the approval status of a research workflow.
    """

    result = research_collection.find_one_and_update(
        {"researchflow_id": researchflow_id},
        {
            "$set": {
                "approval_status": approval_status,
                "result.final_research_plan.approval_status": approval_status,
                **(fields or {}),
            }
        },
        sort=[("created_at", -1)],
        return_document=ReturnDocument.AFTER,
    )

    if result is None:
        raise ValueError(
            "Research workflow not found"
        )

    result.pop("_id", None)

    return result