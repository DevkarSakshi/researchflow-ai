from bson import ObjectId
from gridfs import GridFSBucket
from io import BytesIO

from database.connection import db


paper_bucket = GridFSBucket(db, bucket_name="research_papers")


def store_uploaded_paper(
    content: bytes,
    filename: str,
    workflow_id,
    researchflow_id: str,
) -> str:
    paper_id = ObjectId()
    paper_bucket.upload_from_stream_with_id(
        paper_id,
        filename,
        BytesIO(content),
        metadata={
            "workflow_id": str(workflow_id),
            "researchflow_id": researchflow_id,
            "content_type": "application/pdf",
        },
    )
    return str(paper_id)


def delete_uploaded_paper(paper_id: str) -> None:
    paper_bucket.delete(ObjectId(paper_id))