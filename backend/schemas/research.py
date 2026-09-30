from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024
MAX_TOTAL_PDF_SIZE_BYTES = 20 * 1024 * 1024


class ResearchRequest(BaseModel):
    research_problem: str = Field(default="", max_length=10_000)
    pdfs: list["UploadedPDF"] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def enforce_total_pdf_size(self):
        if sum(pdf.size_bytes for pdf in self.pdfs) > MAX_TOTAL_PDF_SIZE_BYTES:
            raise ValueError("Combined PDF uploads exceed the 20 MiB request limit.")
        return self


class UploadedPDF(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = "application/pdf"
    size_bytes: int = Field(gt=0, le=MAX_PDF_SIZE_BYTES)
    content_base64: str = Field(min_length=1, max_length=14_000_000)

    @field_validator("filename")
    @classmethod
    def require_pdf_extension(cls, filename: str) -> str:
        if not filename.casefold().endswith(".pdf"):
            raise ValueError("Only PDF files are accepted.")
        return filename

    @field_validator("content_type")
    @classmethod
    def require_pdf_mime_type(cls, content_type: str) -> str:
        if content_type.casefold() != "application/pdf":
            raise ValueError("Only application/pdf files are accepted.")
        return content_type


class ResearchApprovalRequest(BaseModel):
    approval_status: Literal["approved", "rejected", "changes_requested"]
    deadline: date | None = None
    student_notes: str | None = Field(default=None, max_length=10_000)