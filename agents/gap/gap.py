from backend.core.gemini_client import client


class GapAgent:
    """
    Gap Agent responsible for identifying research gaps
    and limitations from existing research papers.
    """

    def identify_gaps(
        self,
        papers: list[dict],
        comparison: list[dict]
    ) -> list[str]:
        """
        Identify research gaps from the available
        research papers and comparison matrix.
        """

        gaps = []

        for item in comparison:
            methodology = item.get(
                "methodology",
                "Not available"
            )

            dataset = item.get(
                "dataset",
                "Not available"
            )

            results = item.get(
                "results",
                "Not available"
            )

            if methodology == "AI analysis temporarily unavailable.":
                gaps.append(
                    f"Detailed methodology analysis is currently unavailable for: "
                    f"{item.get('title', 'this paper')}"
                )

            if dataset == "Not available":
                gaps.append(
                    f"Dataset information is not available for: "
                    f"{item.get('title', 'this paper')}"
                )

            if results == "Not available":
                gaps.append(
                    f"Detailed result information is not available for: "
                    f"{item.get('title', 'this paper')}"
                )

        if not gaps:
            gaps.append(
                "Further analysis is required to identify limitations "
                "and unexplored research areas."
            )

        return gaps