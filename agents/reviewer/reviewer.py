class ReviewerAgent:
    """
    Reviewer Agent responsible for checking the
    quality, consistency, and completeness of the
    proposed research plan.

    This agent is deterministic and does not use Gemini.
    """

    def review_research_plan(
        self,
        research_problem: str,
        research_gaps: list[dict],
        research_ideas: list[dict],
        methodology: dict,
        citations: list[dict]
    ) -> str:
        """
        Review the research workflow and provide
        structured feedback.
        """

        feedback = []

        # --------------------------------
        # 1. Research problem
        # --------------------------------

        if not research_problem or not research_problem.strip():

            feedback.append(
                "Research problem is not clearly defined."
            )

        # --------------------------------
        # 2. Research gaps
        # --------------------------------

        if not research_gaps:

            feedback.append(
                "No research gaps have been identified."
            )

        else:

            valid_gaps = [
                gap for gap in research_gaps
                if isinstance(gap, dict)
                and gap.get("title")
                and gap.get("description")
            ]

            if not valid_gaps:

                feedback.append(
                    "Research gaps are present but lack "
                    "sufficient structured evidence."
                )

        # --------------------------------
        # 3. Research ideas
        # --------------------------------

        if not research_ideas:

            feedback.append(
                "No research ideas have been generated."
            )

        else:

            valid_ideas = [
                idea for idea in research_ideas
                if isinstance(idea, dict)
                and idea.get("title")
                and idea.get("core_hypothesis")
                and idea.get("source_gap")
            ]

            if not valid_ideas:

                feedback.append(
                    "Research ideas are present but are missing "
                    "key fields such as hypothesis or source gap."
                )

        # --------------------------------
        # 4. Check gap → idea consistency
        # --------------------------------

        if research_gaps and research_ideas:

            gap_titles = {
                str(gap.get("title", "")).strip().lower()
                for gap in research_gaps
                if isinstance(gap, dict)
            }

            linked_ideas = 0

            for idea in research_ideas:

                if not isinstance(idea, dict):
                    continue

                source_gap = str(
                    idea.get("source_gap", "")
                ).strip().lower()

                if source_gap in gap_titles:
                    linked_ideas += 1

            if linked_ideas == 0:

                feedback.append(
                    "Research ideas are not clearly linked "
                    "to the identified research gaps."
                )

        # --------------------------------
        # 5. Methodology
        # --------------------------------

        if not methodology:

            feedback.append(
                "Research methodology is missing."
            )

        else:

            required_fields = [
                "problem_definition",
                "research_objective",
                "data_collection",
                "preprocessing",
                "baseline_models",
                "proposed_approach",
                "training_strategy",
                "evaluation"
            ]

            missing_fields = [
                field
                for field in required_fields
                if not methodology.get(field)
                or methodology.get(field) == "Not available"
            ]

            if missing_fields:

                feedback.append(
                    "Methodology is incomplete. Missing or "
                    "unavailable sections: "
                    + ", ".join(missing_fields)
                    + "."
                )

        # --------------------------------
        # 6. Citations
        # --------------------------------

        if not citations:

            feedback.append(
                "No citations are available."
            )

        else:

            valid_citations = [
                citation
                for citation in citations
                if isinstance(citation, dict)
                and citation.get("title")
            ]

            if not valid_citations:

                feedback.append(
                    "Citation records are present but "
                    "do not contain valid paper information."
                )

        # --------------------------------
        # 7. Final review decision
        # --------------------------------

        if not feedback:

            return (
                "REVIEW PASSED\n\n"
                "The research plan contains a clearly defined "
                "research problem, evidence-based research gaps, "
                "research ideas linked to the identified gaps, "
                "a structured methodology, and citation records.\n\n"
                "The plan is ready for final research-plan generation "
                "and human approval."
            )

        return (
            "REVIEW REQUIRES ATTENTION\n\n"
            + "\n".join(
                f"- {item}"
                for item in feedback
            )
        )