class CitationAgent:
    """
    Citation Agent responsible for organizing
    retrieved academic papers into structured
    citation records.

    This agent is deterministic and does not use Gemini.
    """

    def organize_citations(
        self,
        papers: list[dict]
    ) -> list[dict]:

        citations = []

        for paper in papers:

            title = paper.get(
                "title",
                "Not available"
            )

            authors = paper.get(
                "authors",
                []
            )

            year = paper.get(
                "year"
            )

            venue = paper.get(
                "venue",
                "Not available"
            )

            doi = paper.get(
                "doi"
            )

            url = paper.get(
                "url"
            )

            pdf_url = paper.get(
                "pdf_url"
            )

            source = paper.get(
                "source",
                "Unknown"
            )

            # -----------------------------
            # APA-style readable citation
            # -----------------------------

            if authors:

                author_text = ", ".join(
                    authors
                )

            else:

                author_text = (
                    "Authors not available"
                )

            year_text = (
                str(year)
                if year
                else "n.d."
            )

            if venue and venue != "Not available":
                 citation_text = (
        f"{author_text} "
        f"({year_text}). "
        f"{title}. "
        f"{venue}."
    )
            else:
                citation_text = (
                    f"{author_text} "
                    f"({year_text}). "
                    f"{title}."
                )

            if doi:
                citation_text += f" DOI: {doi}"

            citations.append({

                "title": title,

                "authors": authors,

                "year": year,

                "venue": venue,

                "doi": (
                    doi
                    if doi
                    else "Not available"
                ),

                "url": (
                    url
                    if url
                    else "Not available"
                ),

                "pdf_url": (
                    pdf_url
                    if pdf_url
                    else "Not available"
                ),

                "source": source,

                "citation_text": citation_text
            })

        return citations