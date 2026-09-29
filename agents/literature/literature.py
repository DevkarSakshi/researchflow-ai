import requests


class LiteratureAgent:
    """
    Literature Agent responsible for finding relevant
    academic research papers for a research problem.
    """

    def search_literature(self, research_problem: str) -> list[dict]:
        """
        Search Crossref for relevant academic papers.
        """

        url = "https://api.crossref.org/works"

        params = {
            "query": research_problem,
            "rows": 5,
            "select": "title,author,published,abstract,URL,container-title,DOI"
        }

        response = requests.get(
            url,
            params=params,
            headers={
                "User-Agent": "ResearchFlow-AI/1.0"
            },
            timeout=20
        )

        response.raise_for_status()

        data = response.json()

        papers = []

        for paper in data.get("message", {}).get("items", []):
            authors = []

            for author in paper.get("author", []):
                name = " ".join(
                    filter(
                        None,
                        [
                            author.get("given"),
                            author.get("family")
                        ]
                    )
                )

                if name:
                    authors.append(name)

            papers.append({
                "title": (
                    paper.get("title", [""])[0]
                    if paper.get("title")
                    else ""
                ),
                "authors": authors,
                "year": (
                    paper.get("published", {})
                    .get("date-parts", [[None]])[0][0]
                ),
                "abstract": paper.get("abstract"),
                "url": paper.get("URL"),
                "venue": (
                    paper.get("container-title", [""])[0]
                    if paper.get("container-title")
                    else ""
                ),
                "doi": paper.get("DOI")
            })

        return papers