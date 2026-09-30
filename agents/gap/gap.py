class GapAgent:
    """
    Gap Agent responsible for identifying research gaps
    and limitations from existing research papers.
    """

    def identify_gaps(
        self,
        papers: list[dict],
        comparison: list[dict]
    ,
        paper_analysis: list[dict] | None = None,
    ) -> list[dict]:
        """
        Identify research gaps from the available
        research papers and comparison matrix.
        """

        analyses = {
            _paper_id(item): item
            for item in (paper_analysis or [])
        }
        comparisons = {_paper_id(item): item for item in comparison}
        gaps = []

        for paper in papers:
            paper_id = _paper_id(paper)
            analysis = analyses.get(paper_id, {})
            compared = comparisons.get(paper_id, {})
            title = paper.get("title") or analysis.get("title") or "Untitled source"
            evidence = analysis.get("evidence", [])
            limitations = analysis.get("limitations")

            if limitations and limitations != "Not reported":
                gaps.append(_make_gap(
                    "reported_limitation",
                    f"Reported limitation in {title}: {limitations}",
                    paper_id,
                    title,
                    _evidence_for(evidence, "limitations", limitations),
                ))

            if compared.get("dataset", "Not reported") == "Not reported":
                gaps.append(_make_gap(
                    "dataset_not_reported",
                    f"The available text for {title} does not report a dataset or data source.",
                    paper_id,
                    title,
                    _evidence_for(evidence, "abstract", analysis.get("abstract", "")),
                ))

            if not compared.get("evaluation_metrics"):
                gaps.append(_make_gap(
                    "evaluation_not_reported",
                    f"The available text for {title} does not identify evaluation metrics.",
                    paper_id,
                    title,
                    _evidence_for(evidence, "results", analysis.get("results", "")),
                ))

            comparison_text = " ".join(
                str(compared.get(field, ""))
                for field in ("methodology", "experiments", "results")
            ).casefold()
            if comparison_text and "baseline" not in comparison_text:
                gaps.append(_make_gap(
                    "baseline_not_reported",
                    f"The available text for {title} does not identify a comparison baseline.",
                    paper_id,
                    title,
                    _evidence_for(evidence, "experiments", analysis.get("experiments", "")),
                ))

        return gaps


def _make_gap(gap_type, description, paper_id, title, evidence):
    return {
        "gap_id": f"{gap_type}:{paper_id}",
        "gap_type": gap_type,
        "description": description,
        "source_paper_ids": [paper_id],
        "source_paper_titles": [title],
        "evidence": evidence,
    }


def _evidence_for(evidence, field_name, fallback):
    matches = [item for item in evidence if item.get("field") == field_name]
    if matches:
        return matches
    if fallback and fallback != "Not reported":
        return [{"field": field_name, "excerpt": str(fallback)[:800], "pages": []}]
    return []


def _paper_id(paper: dict) -> str:
    return str(
        paper.get("paper_id")
        or paper.get("doi")
        or paper.get("url")
        or paper.get("title")
        or paper.get("filename")
        or "unknown-paper"
    )