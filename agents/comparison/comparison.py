class ComparisonAgent:
    """
    Comparison Agent responsible for comparing
    research papers based on their extracted information.
    """

    def compare_papers(
        self,
        papers: list[dict],
        paper_analysis: list[dict]
    ) -> list[dict]:
        """
        Compare research papers using their metadata
        and Paper Intelligence results.
        """

        analyses = {
            _paper_id(analysis): analysis
            for analysis in paper_analysis
        }
        comparison = []

        for paper in papers:
            analysis = analyses.get(_paper_id(paper), {})
            comparison.append({
                "paper_id": _paper_id(paper),
                "title": paper.get("title") or "Not reported",
                "authors": paper.get("authors", []),
                "year": paper.get("year"),
                "venue": paper.get("venue") or "Not reported",
                "doi": paper.get("doi"),
                "url": paper.get("url"),
                "source": paper.get("source") or paper.get("source_type"),
                "methodology": analysis.get("methodology", "Not reported"),
                "dataset": analysis.get("dataset", "Not reported"),
                "models_or_techniques": analysis.get("models_or_techniques", []),
                "experiments": analysis.get("experiments", "Not reported"),
                "evaluation_metrics": analysis.get("evaluation_metrics", []),
                "results": analysis.get("results", "Not reported"),
                "limitations": analysis.get("limitations", "Not reported"),
                "contributions": analysis.get("contributions", "Not reported"),
                "evidence": analysis.get("evidence", []),
            })

        return comparison


def _paper_id(paper: dict) -> str:
    return str(
        paper.get("paper_id")
        or paper.get("doi")
        or paper.get("url")
        or paper.get("title")
        or paper.get("filename")
        or "unknown-paper"
    )