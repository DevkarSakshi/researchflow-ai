from pydantic import BaseModel


class ResearchRequest(BaseModel):
    research_problem: str

class ResearchApprovalRequest(BaseModel):
    approval_status: str