class CitationAgent:
    """
    Citation Agent responsible for organizing
    research paper references.
    """

    def organize_citations(
        self,
        papers: list[dict]
    ) -> list[dict]:
        """
        Organize retrieved papers into structured
        citation records.
        """

        citations = []

        for paper in papers:
            citations.append({
                "title": paper.get(
                    "title",
                    "Not available"
                ),
                "authors": paper.get(
                    "authors",
                    []
                ),
                "year": paper.get(
                    "year"
                ),
                "venue": paper.get(
                    "venue",
                    "Not available"
                ),
                "doi": paper.get(
                    "doi",
                    "Not available"
                ),
                "url": paper.get(
                    "url",
                    "Not available"
                )
            })

        return citations