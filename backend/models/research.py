from datetime import datetime, timezone

from pydantic import BaseModel, Field


class ResearchWorkflow(BaseModel):
    researchflow_id: str
    research_problem: str
    status: str = "started"
    created_at: datetime = Field(
    default_factory=lambda: datetime.now(timezone.utc)
)