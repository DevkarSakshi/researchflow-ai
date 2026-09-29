class FinalResearchPlanAgent:
    """
    Final Research Plan Agent responsible for combining
    all research-agent outputs into a structured plan.
    """

    def create_final_plan(
        self,
        research_problem: str,
        papers: list[dict],
        comparison: list[dict],
        research_gaps: list[str],
        research_ideas: list[str],
        methodology: dict,
        citations: list[dict],
        reviewer_feedback: str
    ) -> dict:
        """
        Combine all research workflow outputs into
        one final research plan.
        """

        return {
            "research_problem": research_problem,
            "literature": papers,
            "comparison": comparison,
            "research_gaps": research_gaps,
            "research_ideas": research_ideas,
            "methodology": methodology,
            "citations": citations,
            "reviewer_feedback": reviewer_feedback,
            "approval_status": "pending"
        }

    def update_approval_status(
        self,
        approval_status: str
    ) -> str:
        """
        Validate and update the approval status
        of the final research plan.
        """

        allowed_statuses = {
            "pending",
            "approved",
            "changes_requested",
            "rejected"
        }

        if approval_status not in allowed_statuses:
            raise ValueError(
                "Invalid approval status"
            )

        return approval_status