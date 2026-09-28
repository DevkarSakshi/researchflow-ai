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