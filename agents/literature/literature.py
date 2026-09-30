import hashlib
import re

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
        return self.search_literature_with_status(research_problem)["papers"]

    def search_literature_with_status(self, research_problem: str) -> dict:
        if not research_problem.strip():
            return {"papers": [], "sources": []}

        papers = []
        sources = []
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
                    "source": "Crossref",
                })
            sources.append({"name": "Crossref", "status": "completed"})
        except (requests.RequestException, ValueError, KeyError, TypeError) as error:
            sources.append({"name": "Crossref", "status": "failed", "error": str(error)})

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
                    "source": "Semantic Scholar",
                })
            sources.append({"name": "Semantic Scholar", "status": "completed"})
        except (requests.RequestException, ValueError, KeyError, TypeError) as error:
            sources.append({"name": "Semantic Scholar", "status": "failed", "error": str(error)})

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
                paper["paper_id"] = _paper_id(paper)
                unique_papers.append(paper)

        return {"papers": unique_papers, "sources": sources}


def _paper_id(paper: dict) -> str:
    doi = (paper.get("doi") or "").strip()
    if doi:
        return "doi:" + doi.removeprefix("https://doi.org/").removeprefix("http://doi.org/").casefold()
    if paper.get("url"):
        return str(paper["url"])
    title = " ".join((paper.get("title") or "").casefold().split())
    return "title:" + hashlib.sha256(title.encode("utf-8")).hexdigest()[:20]