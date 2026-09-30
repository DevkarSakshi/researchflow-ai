class ReviewerAgent:
    """
    Reviewer Agent responsible for checking the
    quality and consistency of the proposed research plan.
    """

    def review_research_plan(
        self,
        research_problem: str,
        research_gaps: list[dict],
        research_ideas: list[dict],
        methodology: dict,
        citations: list[dict],
        paper_analysis: list[dict] | None = None,
        comparison: list[dict] | None = None,
    ) -> dict:
        """
        Review the research workflow and provide
        structured feedback.
        """

        analyses = paper_analysis or []
        comparisons = comparison or []
        checks = [
            _check("research_problem", "Research problem is defined", bool(research_problem.strip()), "Provide a focused research problem."),
            _check("source_evidence", "Research sources are available", bool(analyses), "Add an uploaded paper or retrieve literature before drawing conclusions."),
            _check("datasets", "A dataset or data source is reported", any(item.get("dataset") not in (None, "", "Not reported") for item in analyses), "Document an appropriate dataset or state why the work does not require one."),
            _check("evaluation", "Evaluation metrics are identified", any(item.get("evaluation_metrics") for item in analyses), "Specify measurable evaluation criteria."),
            _check("baselines", "Comparison baselines are documented", any("baseline" in str(row).casefold() for row in comparisons), "Document relevant baselines before claiming improvement."),
            _check("methodology", "Methodology contains evidence-linked steps", bool(methodology.get("steps")) and bool(methodology.get("source_paper_ids")), "Ground the methodology in available evidence and specify reproducible steps."),
            _check("citations", "Sources have citation metadata", any(item.get("status") == "complete" for item in citations), "Complete source metadata where it is available; do not infer missing bibliographic facts."),
            _check("limitations", "Source limitations are acknowledged", any(item.get("limitations") not in (None, "", "Not reported") for item in analyses), "Review source limitations and record any limitations of the proposed study."),
        ]
        concerns = [check for check in checks if check["status"] != "passed"]
        strengths = [check["label"] for check in checks if check["status"] == "passed"]
        return {
            "status": "needs_attention" if concerns else "ready_for_student_review",
            "checks": checks,
            "strengths": strengths,
            "concerns": concerns,
            "required_revisions": [item["id"] for item in concerns],
            "questions_for_researcher": [item["remediation"] for item in concerns],
            "score": None,
            "method": "deterministic_checklist",
        }


def _check(check_id, label, passed, remediation):
    return {
        "id": check_id,
        "label": label,
        "status": "passed" if passed else "needs_attention",
        "remediation": None if passed else remediation,
    }