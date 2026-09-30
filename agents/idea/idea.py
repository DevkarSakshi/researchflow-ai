class IdeaAgent:
    """
    Idea Agent responsible for generating possible
    research directions from identified research gaps.
    """

    def generate_ideas(
        self,
        research_problem: str,
        research_gaps: list[dict]
    ) -> list[dict]:
        """
        Generate research ideas based on the
        identified research gaps.
        """

        ideas = []
        for gap in research_gaps:
            gap_id = gap.get("gap_id")
            description = gap.get("description")
            if not gap_id or not description:
                continue

            gap_type = gap.get("gap_type", "evidence_gap")
            if gap_type == "reported_limitation":
                approach = "Design a controlled study that measures the cited limitation and evaluates a targeted mitigation."
                hypothesis = f"A targeted mitigation of this reported limitation may improve outcomes: {description}"
            elif gap_type == "dataset_not_reported":
                approach = "Reproduce the reported approach on a documented dataset and report the dataset and protocol."
                hypothesis = f"Re-evaluating the reported approach on a documented dataset will clarify its empirical support: {description}"
            elif gap_type == "evaluation_not_reported":
                approach = "Define explicit evaluation metrics and compare the documented approach against stated baselines."
                hypothesis = f"Explicit evaluation criteria will establish whether the documented approach meets its stated objective: {description}"
            elif gap_type == "baseline_not_reported":
                approach = "Reproduce the study with clearly specified and consistently evaluated baselines."
                hypothesis = f"A controlled baseline comparison will clarify the contribution of the reported method: {description}"
            else:
                approach = "Investigate the cited evidence gap using a reproducible study design."
                hypothesis = f"A study targeting this evidence gap can establish findings that the current sources do not report: {description}"

            evidence = gap.get("evidence", [])
            ideas.append({
                "idea_id": f"candidate:{gap_id}",
                "status": "candidate_for_researcher_review",
                "hypothesis": hypothesis,
                "problem_addressed": description,
                "motivation": evidence,
                "proposed_approach": approach,
                "expected_contribution": "A reproducible result addressing the cited gap; the contribution is not established until validated.",
                "gap_id": gap_id,
                "source_paper_ids": gap.get("source_paper_ids", []),
                "research_problem": research_problem,
            })

        return ideas