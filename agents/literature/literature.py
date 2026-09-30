import requests


class LiteratureAgent:
    """
    Literature Agent responsible for finding relevant
    academic research papers for a research problem.
    """

    def search_literature(self, research_problem: str) -> list[dict]:
        """
        Search Crossref and Semantic Scholar for relevant
        academic papers and collect available open-access
        full-text PDF links when provided.
        """

        papers = []

        # -------------------------------------------------
        # Crossref
        # -------------------------------------------------

        try:
            response = requests.get(
                "https://api.crossref.org/works",
                params={
                    "query": research_problem,
                    "rows": 5,
                    "select": (
                        "title,author,published,abstract,URL,"
                        "container-title,DOI,link"
                    )
                },
                headers={
                    "User-Agent": "ResearchFlow-AI/1.0"
                },
                timeout=20
            )

            response.raise_for_status()

            for paper in response.json().get(
                "message", {}
            ).get("items", []):

                authors = [
                    " ".join(
                        filter(
                            None,
                            [
                                author.get("given"),
                                author.get("family")
                            ]
                        )
                    )
                    for author in paper.get(
                        "author",
                        []
                    )
                ]

                authors = [
                    author
                    for author in authors
                    if author
                ]

                # Crossref can provide one or more
                # content links.
                pdf_url = None

                for link in paper.get("link", []):

                    content_type = (
                        link.get("content-type", "")
                        .lower()
                    )

                    if (
                        "pdf" in content_type
                        or str(
                            link.get("URL", "")
                        ).lower().endswith(".pdf")
                    ):
                        pdf_url = link.get("URL")
                        break

                papers.append({
                    "title": (
                        paper.get(
                            "title",
                            [""]
                        )[0]
                        if paper.get("title")
                        else ""
                    ),

                    "authors": authors,

                    "year": (
                        paper.get(
                            "published",
                            {}
                        )
                        .get(
                            "date-parts",
                            [[None]]
                        )[0][0]
                    ),

                    "abstract": paper.get(
                        "abstract"
                    ),

                    "venue": (
                        paper.get(
                            "container-title",
                            [""]
                        )[0]
                        if paper.get(
                            "container-title"
                        )
                        else ""
                    ),

                    "doi": paper.get(
                        "DOI"
                    ),

                    "url": paper.get(
                        "URL"
                    ),

                    "pdf_url": pdf_url,

                    "source": "Crossref"
                })

        except (
            requests.RequestException,
            ValueError,
            KeyError,
            TypeError
        ):
            pass

        # -------------------------------------------------
        # Semantic Scholar
        # -------------------------------------------------

        try:
            response = requests.get(
                "https://api.semanticscholar.org/graph/v1/paper/search",
                params={
                    "query": research_problem,
                    "limit": 5,
                    "fields": (
                        "title,authors,year,abstract,venue,"
                        "externalIds,url,openAccessPdf"
                    )
                },
                timeout=20
            )

            response.raise_for_status()

            for paper in response.json().get(
                "data",
                []
            ):

                external_ids = (
                    paper.get("externalIds")
                    or {}
                )

                open_access_pdf = (
                    paper.get("openAccessPdf")
                    or {}
                )

                pdf_url = (
                    open_access_pdf.get("url")
                )

                papers.append({
                    "title": (
                        paper.get(
                            "title"
                        )
                        or ""
                    ),

                    "authors": [
                        author.get(
                            "name",
                            ""
                        )
                        for author in paper.get(
                            "authors",
                            []
                        )
                        if author.get("name")
                    ],

                    "year": paper.get(
                        "year"
                    ),

                    "abstract": paper.get(
                        "abstract"
                    ),

                    "venue": (
                        paper.get(
                            "venue"
                        )
                        or ""
                    ),

                    "doi": external_ids.get(
                        "DOI"
                    ),

                    "url": paper.get(
                        "url"
                    ),

                    "pdf_url": pdf_url,

                    "source": "Semantic Scholar"
                })

        except (
            requests.RequestException,
            ValueError,
            KeyError,
            TypeError
        ):
            pass

        # -------------------------------------------------
        # Remove duplicate papers
        # -------------------------------------------------

        unique_papers = []
        seen = set()

        for paper in papers:

            doi = (
                paper.get("doi")
                or ""
            ).strip().lower()

            if doi:

                key = (
                    "doi",
                    doi.removeprefix(
                        "https://doi.org/"
                    ).removeprefix(
                        "http://doi.org/"
                    )
                )

            else:

                normalized_title = " ".join(
                    (
                        paper.get("title")
                        or ""
                    ).casefold().split()
                )

                key = (
                    "title",
                    normalized_title
                )

            if key not in seen:

                seen.add(key)
                unique_papers.append(
                    paper
                )

        return unique_papers[:10]