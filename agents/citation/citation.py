import re


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
            title = paper.get("title")
            authors = paper.get("authors") or []
            year = paper.get("year")
            venue = paper.get("venue")
            doi = paper.get("doi")
            url = paper.get("url")
            paper_id = _paper_id(paper)

            citation = {
                "paper_id": paper_id,
                "title": title,
                "authors": authors,
                "year": year,
                "venue": venue,
                "doi": doi,
                "url": url,
                "source": paper.get("source") or paper.get("source_type"),
                "status": "complete" if title and authors and year else "incomplete_metadata",
                "apa7": None,
                "ieee": None,
                "bibtex": None,
            }
            if title:
                author_text = _apa_authors(authors)
                year_text = f" ({year})." if year else " (n.d.)."
                apa = f"{author_text}{year_text} {title}."
                if venue:
                    apa += f" {venue}."
                if doi:
                    apa += f" https://doi.org/{doi.removeprefix('https://doi.org/')}"
                elif url:
                    apa += f" {url}"

                ieee_parts = []
                if authors:
                    ieee_parts.append(_ieee_authors(authors))
                ieee_parts.append(f'"{title},"')
                if venue:
                    ieee_parts.append(venue)
                if year:
                    ieee_parts.append(str(year))
                if doi:
                    ieee_parts.append(f"doi: {doi}")
                elif url:
                    ieee_parts.append(url)
                citation["apa7"] = " ".join(apa.split())
                citation["ieee"] = ", ".join(ieee_parts) + "."
                citation["bibtex"] = _bibtex(paper, title, authors, year, venue)
            citations.append(citation)

        return citations


def _paper_id(paper: dict) -> str:
    return str(paper.get("paper_id") or paper.get("doi") or paper.get("url") or paper.get("title") or "unknown-paper")


def _apa_authors(authors: list[str]) -> str:
    return ", ".join(authors) if authors else "Author not reported"


def _ieee_authors(authors: list[str]) -> str:
    return ", ".join(authors) if authors else "Author not reported"


def _bibtex(paper, title, authors, year, venue):
    identity = paper.get("doi") or paper.get("url") or title
    key = re.sub(r"[^a-z0-9]+", "", str(identity).casefold())[:32] or "paper"
    fields = {
        "title": title,
        "author": " and ".join(authors) if authors else None,
        "year": year,
        "journal": venue,
        "doi": paper.get("doi"),
        "url": paper.get("url"),
    }
    formatted_fields = [
        f"  {name} = {{{_escape_bibtex(value)}}}"
        for name, value in fields.items()
        if value is not None and value != ""
    ]
    return "@article{" + key + ",\n" + ",\n".join(formatted_fields) + "\n}"


def _escape_bibtex(value) -> str:
    return str(value).replace("\\", r"\textbackslash{}").replace("{", r"\{").replace("}", r"\}")