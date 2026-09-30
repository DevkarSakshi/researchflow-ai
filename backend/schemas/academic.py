from datetime import date
from typing import Literal

from pydantic import AliasChoices, BaseModel, Field, model_validator


class AcademicTaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: str = Field(default="", max_length=5_000)
    type: Literal["assignment", "exam", "research_milestone", "paper_reading"] = "research_milestone"
    course_or_project: str | None = Field(
        default=None,
        validation_alias=AliasChoices("course_or_project", "courseOrProject"),
    )
    due_date: date = Field(
        validation_alias=AliasChoices("due_date", "dueDate", "end_date"),
    )
    start_date: date | None = None
    priority: Literal["low", "medium", "high"] = "medium"

    @model_validator(mode="after")
    def validate_task_dates(self):
        if self.start_date and self.start_date > self.due_date:
            raise ValueError("Task start date cannot be after its due date.")
        return self


class AcademicTaskStatusUpdate(BaseModel):
    status: Literal["pending", "in_progress", "completed", "blocked"]


class AcademicTaskResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    status: str
    priority: str
    type: str = "research_milestone"
    course_or_project: str | None = None
    start_date: str
    end_date: str
    dependencies: list[str] = Field(default_factory=list)
    source_section: str | None = None
    reason: str = ""


class AcademicStateResponse(BaseModel):
    project: dict | None = None
    tasks: list[AcademicTaskResponse] = Field(default_factory=list)
    milestones: list[dict] = Field(default_factory=list)
    reminders: list[dict] = Field(default_factory=list)
    progress: dict
    analytics: dict