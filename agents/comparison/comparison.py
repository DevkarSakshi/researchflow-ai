from backend.core.gemini_client import client


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

        comparison = []

        for index, paper in enumerate(papers):
            analysis = (
                paper_analysis[index]
                if index < len(paper_analysis)
                else {}
            )

            comparison.append({
                "title": paper.get("title", "Not available"),
                "authors": paper.get("authors", []),
                "year": paper.get("year"),
                "methodology": analysis.get(
                    "methodology",
                    "Not available"
                ),
                "dataset": analysis.get(
                    "dataset",
                    "Not available"
                ),
                "models_or_techniques": analysis.get(
                    "models_or_techniques",
                    []
                ),
                "results": analysis.get(
                    "results",
                    "Not available"
                )
            })

        return comparison