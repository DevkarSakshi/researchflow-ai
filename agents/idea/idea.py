class IdeaAgent:
    """
    Idea Agent responsible for generating possible
    research directions from identified research gaps.
    """

    def generate_ideas(
        self,
        research_problem: str,
        research_gaps: list[str]
    ) -> list[str]:
        """
        Generate research ideas based on the
        identified research gaps.
        """

        ideas = []

        if research_gaps:
            for gap in research_gaps[:5]:
                ideas.append(
                    f"Develop an improved AI approach to address: {gap}"
                )

        if not ideas:
            ideas.append(
                f"Explore an improved AI-based solution for: "
                f"{research_problem}"
            )

        return ideas