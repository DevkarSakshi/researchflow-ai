import base64
import binascii
import re
from io import BytesIO
from pathlib import PurePosixPath

from pypdf import PdfReader

from schemas.research import MAX_PDF_SIZE_BYTES, MAX_TOTAL_PDF_SIZE_BYTES, UploadedPDF


MAX_PDF_PAGES = 500
DOI_PATTERN = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+", re.IGNORECASE)
URL_PATTERN = re.compile(r"https?://\S+", re.IGNORECASE)
YEAR_PATTERN = re.compile(r"\b(?:19|20)\d{2}\b")

SECTION_HEADINGS = {
    "abstract": ("abstract",),
    "problem": ("introduction", "background", "problem statement"),
    "methodology": ("methodology", "methods", "materials and methods", "approach"),
    "dataset": ("dataset", "datasets", "data collection"),
    "experiments": ("experiments", "experimental setup", "evaluation"),
    "results": ("results", "findings"),
    "limitations": ("limitations", "threats to validity", "future work"),
    "contributions": ("contributions",),
}


class PDFIngestionError(ValueError):
    pass


def extract_uploaded_pdf(upload: UploadedPDF) -> dict:
    """Validate and extract text/metadata without sending the PDF to an LLM."""
    if upload.size_bytes > MAX_PDF_SIZE_BYTES:
        raise PDFIngestionError("PDF exceeds the 10 MiB per-file limit.")

    filename = PurePosixPath(upload.filename.replace("\\", "/")).name
    if not filename.casefold().endswith(".pdf"):
        raise PDFIngestionError("Only PDF files are accepted.")
    max_encoded_size = ((upload.size_bytes + 2) // 3) * 4 + 128
    if len(upload.content_base64) > max_encoded_size:
        raise PDFIngestionError("Encoded PDF content exceeds its declared file size.")

    try:
        content = base64.b64decode(upload.content_base64, validate=True)
    except (binascii.Error, ValueError) as error:
        raise PDFIngestionError("Uploaded PDF content is not valid base64.") from error

    if len(content) != upload.size_bytes:
        raise PDFIngestionError("Uploaded PDF size does not match its content.")
    if len(content) > MAX_PDF_SIZE_BYTES:
        raise PDFIngestionError("PDF exceeds the 10 MiB per-file limit.")
    if not content.startswith(b"%PDF-"):
        raise PDFIngestionError("Uploaded content is not a valid PDF document.")

    try:
        reader = PdfReader(BytesIO(content), strict=False)
        if reader.is_encrypted:
            raise PDFIngestionError("Encrypted PDFs are not supported.")
        if len(reader.pages) > MAX_PDF_PAGES:
            raise PDFIngestionError("PDF exceeds the 500-page limit.")
        page_texts = [
            {"page": index + 1, "text": page.extract_text() or ""}
            for index, page in enumerate(reader.pages)
        ]
    except PDFIngestionError:
        raise
    except Exception as error:
        raise PDFIngestionError("Could not parse the uploaded PDF.") from error

    text = "\n\n".join(page["text"] for page in page_texts).strip()
    metadata = reader.metadata or {}
    title = _metadata_value(metadata, "/Title") or _first_document_line(text)
    authors = _parse_authors(_metadata_value(metadata, "/Author"))
    doi_match = DOI_PATTERN.search(text)
    doi = doi_match.group(0).rstrip(".,;:") if doi_match else None
    url_match = URL_PATTERN.search(text)
    url = url_match.group(0).rstrip(".,;)") if url_match else None
    year = _extract_year(metadata, text)

    return {
        "filename": filename,
        "content_type": "application/pdf",
        "size_bytes": len(content),
        "page_count": len(reader.pages),
        "metadata": {
            "title": title,
            "authors": authors,
            "year": year,
            "doi": doi,
            "url": url,
        },
        "sections": _extract_sections(page_texts),
        "page_texts": page_texts,
        "content": content,
    }


def _metadata_value(metadata, key: str) -> str | None:
    value = metadata.get(key) if metadata else None
    return str(value).strip() if value and str(value).strip() else None


def _parse_authors(author: str | None) -> list[str]:
    if not author:
        return []
    return [name.strip() for name in re.split(r"\s*;\s*|\s+and\s+", author) if name.strip()]


def _first_document_line(text: str) -> str | None:
    for line in text.splitlines():
        candidate = " ".join(line.split()).strip(" |\t")
        if len(candidate) >= 8 and not candidate.isdigit():
            return candidate[:500]
    return None


def _extract_year(metadata, text: str) -> int | None:
    for key in ("/CreationDate", "/ModDate"):
        value = _metadata_value(metadata, key)
        match = YEAR_PATTERN.search(value or "")
        if match:
            return int(match.group(0))
    for line in text.splitlines():
        if re.search(r"\b(received|accepted|published|copyright)\b", line, re.IGNORECASE):
            match = YEAR_PATTERN.search(line)
            if match:
                return int(match.group(0))
    return None


def _extract_sections(page_texts: list[dict]) -> dict[str, dict]:
    sections = {}
    active_section = None

    for page in page_texts:
        for line in page["text"].splitlines():
            heading = _normalize_heading(line)
            matching_section = next(
                (
                    section
                    for section, names in SECTION_HEADINGS.items()
                    if heading in names
                ),
                None,
            )
            if matching_section:
                active_section = matching_section
                sections.setdefault(active_section, {"text": "", "pages": []})
                if page["page"] not in sections[active_section]["pages"]:
                    sections[active_section]["pages"].append(page["page"])
            elif active_section and line.strip():
                section = sections[active_section]
                section["text"] = (section["text"] + " " + line.strip()).strip()
                if page["page"] not in section["pages"]:
                    section["pages"].append(page["page"])

    return sections


def _normalize_heading(line: str) -> str:
    heading = re.sub(r"^\s*\d+(?:\.\d+)*\s*", "", line)
    return re.sub(r"[^a-z ]", "", heading.casefold()).strip()