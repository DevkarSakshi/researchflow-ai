from database.connection import db


research_collection = db["research_workflows"]


def create_research_workflow(workflow_data: dict):
    """
    Store a research workflow in MongoDB.
    """
    result = research_collection.insert_one(workflow_data)
    return result.inserted_id


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
    approval_status: str
) -> dict:
    """
    Update the approval status of a research workflow
    in MongoDB.
    """

    result = research_collection.find_one_and_update(
        {"researchflow_id": researchflow_id},
        {
            "$set": {
                "approval_status": approval_status
            }
        },
        return_document=True
    )

    if result is None:
        raise ValueError(
            "Research workflow not found"
        )

    result.pop("_id", None)

    return result

def get_latest_workflow_by_user(researchflow_id: str):
    """
    Get the latest research workflow belonging to a student.
    """
    return research_collection.find_one(
        {"researchflow_id": researchflow_id},
        sort=[("created_at", -1)]
    )