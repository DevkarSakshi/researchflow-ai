import re


NOT_REPORTED = "Not reported"
MAX_ANALYSIS_FIELD_CHARS = 12_000
METRIC_PATTERNS = (
    r"\baccuracy\b",
    r"\bprecision\b",
    r"\brecall\b",
    r"\bf1(?:-score)?\b",
    r"\bauc(?:-roc)?\b",
    r"\bbleu\b",
    r"\brouge(?:-l)?\b",
    r"\bmap\b",
    r"\bmrr\b",
    r"\bperplexity\b",
    r"\b\d+(?:\.\d+)?\s?%",
)
METHOD_TERMS = (
    "model", "method", "algorithm", "architecture", "approach",
    "network", "framework", "training", "classifier", "regression",
)


class PaperIntelligenceAgent:
    """Extract paper fields deterministically from PDF text and metadata."""

    def analyze_paper(self, paper: dict) -> dict:
        sections = paper.get("sections", {})
        abstract = (
            _section_text(sections, "abstract")
            or _bounded(paper.get("abstract", ""))
            or ""
        )
        body_text = "\n".join(
            page.get("text", "") for page in paper.get("page_texts", [])
        )
        methodology = _section_text(sections, "methodology")
        dataset = _section_text(sections, "dataset")
        experiments = _section_text(sections, "experiments")
        results = _section_text(sections, "results")
        limitations = _section_text(sections, "limitations")
        contributions = _section_text(sections, "contributions")
        research_problem = _section_text(sections, "problem")

        searchable_text = "\n".join((abstract, body_text))
        if not dataset:
            dataset = _matching_sentences(
                searchable_text,
                ("dataset", "data set", "benchmark", "corpus", "corpora"),
            )
        if not methodology:
            methodology = _matching_sentences(searchable_text, METHOD_TERMS)
        if not results:
            results = _matching_sentences(
                searchable_text,
                ("result", "outperform", "improv", "achiev", "evaluation"),
            )
        if not limitations:
            limitations = _matching_sentences(
                searchable_text,
                ("limitation", "however", "future work", "threat to validity"),
            )
        if not research_problem:
            research_problem = " ".join(_first_sentences(abstract, 2))
        if not contributions:
            contributions = _matching_sentences(
                abstract,
                ("contribute", "propose", "introduce", "present"),
            )

        evidence = []
        for field_name, section_name in (
            ("abstract", "abstract"),
            ("research_problem", "problem"),
            ("methodology", "methodology"),
            ("dataset", "dataset"),
            ("experiments", "experiments"),
            ("results", "results"),
            ("limitations", "limitations"),
            ("contributions", "contributions"),
        ):
            section = sections.get(section_name)
            excerpt = section.get("text", "") if isinstance(section, dict) else ""
            if excerpt:
                evidence.append({
                    "field": field_name,
                    "excerpt": excerpt[:800],
                    "pages": section.get("pages", []),
                })
            elif field_name == "abstract" and abstract:
                evidence.append({
                    "field": field_name,
                    "excerpt": abstract[:800],
                    "pages": [],
                })

        return {
            "paper_id": paper.get("paper_id") or _paper_id(paper),
            "source_type": paper.get("source_type", "web_research"),
            "title": paper.get("title") or NOT_REPORTED,
            "authors": paper.get("authors", []),
            "year": paper.get("year"),
            "venue": paper.get("venue") or NOT_REPORTED,
            "doi": paper.get("doi"),
            "url": paper.get("url"),
            "abstract": abstract or NOT_REPORTED,
            "methodology": methodology or NOT_REPORTED,
            "dataset": dataset or NOT_REPORTED,
            "models_or_techniques": _first_sentences(
                _matching_sentences(methodology, METHOD_TERMS),
                5,
            ),
            "experiments": experiments or NOT_REPORTED,
            "evaluation_metrics": _extract_metrics(
                "\n".join((experiments, results, abstract))
            ),
            "results": results or NOT_REPORTED,
            "key_findings": _first_sentences(results or abstract, 3),
            "limitations": limitations or NOT_REPORTED,
            "research_problem": research_problem or NOT_REPORTED,
            "contributions": contributions or NOT_REPORTED,
            "evidence": evidence,
            "analysis_method": "deterministic_pdf_and_metadata_extraction",
        }


def _section_text(sections: dict, name: str) -> str:
    section = sections.get(name, {})
    if isinstance(section, dict):
        return _bounded(section.get("text", ""))
    return _bounded(section)


def _bounded(value) -> str:
    return " ".join(str(value or "").split())[:MAX_ANALYSIS_FIELD_CHARS]


def _sentences(text: str) -> list[str]:
    return [
        sentence.strip()
        for sentence in re.split(r"(?<=[.!?])\s+|\n+", text)
        if sentence.strip()
    ]


def _matching_sentences(text: str, terms: tuple[str, ...]) -> str:
    matches = [
        sentence
        for sentence in _sentences(text)
        if any(term in sentence.casefold() for term in terms)
    ]
    return _bounded(" ".join(dict.fromkeys(matches)))


def _first_sentences(text: str, limit: int) -> list[str]:
    return _sentences(text)[:limit]


def _extract_metrics(text: str) -> list[str]:
    found = []
    for pattern in METRIC_PATTERNS:
        for match in re.finditer(pattern, text, flags=re.IGNORECASE):
            value = " ".join(match.group(0).split())
            if value.casefold() not in {item.casefold() for item in found}:
                found.append(value)
    return found


def _paper_id(paper: dict) -> str:
    return str(
        paper.get("doi")
        or paper.get("url")
        or paper.get("title")
        or paper.get("filename")
        or "unknown-paper"
    )