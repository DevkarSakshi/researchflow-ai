class ReviewerAgent:
    """
    Reviewer Agent responsible for checking the
    quality and consistency of the proposed research plan.
    """

    def review_research_plan(
        self,
        research_problem: str,
        research_gaps: list[str],
        research_ideas: list[str],
        methodology: dict,
        citations: list[dict]
    ) -> str:
        """
        Review the research workflow and provide
        structured feedback.
        """

        feedback = []

        if not research_problem.strip():
            feedback.append(
                "Research problem is not clearly defined."
            )

        if not research_gaps:
            feedback.append(
                "No research gaps have been identified."
            )

        if not research_ideas:
            feedback.append(
                "No research ideas have been generated."
            )

        if not methodology:
            feedback.append(
                "Research methodology is missing."
            )

        if not citations:
            feedback.append(
                "No citations are available."
            )

        if not feedback:
            return (
                "The research workflow contains the required "
                "components: research problem, literature analysis, "
                "research gaps, research ideas, methodology, "
                "and citations. The plan can proceed to final "
                "review and student approval."
            )

        return "Reviewer feedback:\n" + "\n".join(
            f"- {item}" for item in feedback
        )