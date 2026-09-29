import requests


class LiteratureAgent:
    """
    Literature Agent responsible for finding relevant
    academic research papers for a research problem.
    """

    def search_literature(self, research_problem: str) -> list[dict]:
        """
        Search Crossref and Semantic Scholar for relevant academic papers.
        """
        papers = []
        try:
            response = requests.get(
                "https://api.crossref.org/works",
                params={
                    "query": research_problem,
                    "rows": 5,
                    "select": "title,author,published,abstract,URL,container-title,DOI"
                },
                headers={"User-Agent": "ResearchFlow-AI/1.0"},
                timeout=20
            )
            response.raise_for_status()

            for paper in response.json().get("message", {}).get("items", []):
                authors = [
                    " ".join(filter(None, [author.get("given"), author.get("family")]))
                    for author in paper.get("author", [])
                ]
                authors = [author for author in authors if author]
                papers.append({
                    "title": paper.get("title", [""])[0] if paper.get("title") else "",
                    "authors": authors,
                    "year": paper.get("published", {}).get("date-parts", [[None]])[0][0],
                    "abstract": paper.get("abstract"),
                    "venue": paper.get("container-title", [""])[0] if paper.get("container-title") else "",
                    "doi": paper.get("DOI"),
                    "url": paper.get("URL"),
                    "source": "Crossref"
                })
        except (requests.RequestException, ValueError, KeyError, TypeError):
            pass

        try:
            response = requests.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={
                    "query": research_problem,
                    "limit": 5,
                    "fields": "title,authors,year,abstract,venue,externalIds,url"
                },
                timeout=20
            )
            response.raise_for_status()

            for paper in response.json().get("data", []):
                external_ids = paper.get("externalIds") or {}
                papers.append({
                    "title": paper.get("title") or "",
                    "authors": [author.get("name", "") for author in paper.get("authors", []) if author.get("name")],
                    "year": paper.get("year"),
                    "abstract": paper.get("abstract"),
                    "venue": paper.get("venue") or "",
                    "doi": external_ids.get("DOI"),
                    "url": paper.get("url"),
                    "source": "Semantic Scholar"
                })
        except (requests.RequestException, ValueError, KeyError, TypeError):
            pass

        unique_papers = []
        seen = set()
        for paper in papers:
            doi = (paper.get("doi") or "").strip().lower()
            if doi:
                key = ("doi", doi.removeprefix("https://doi.org/").removeprefix("http://doi.org/"))
            else:
                normalized_title = " ".join((paper.get("title") or "").casefold().split())
                key = ("title", normalized_title)

            if key not in seen:
                seen.add(key)
                unique_papers.append(paper)

        return unique_papers