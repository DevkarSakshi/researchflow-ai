from pydantic import BaseModel


class ResearchRequest(BaseModel):
    research_problem: str