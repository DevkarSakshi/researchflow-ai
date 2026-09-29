class MethodologyAgent:
    """
    Methodology Agent responsible for proposing
    a research methodology based on research ideas.
    """

    def suggest_methodology(
        self,
        research_problem: str,
        research_ideas: list[str]
    ) -> dict:
        """
        Suggest a structured research methodology.
        """

        if not research_ideas:
            return {
                "problem_definition": research_problem,
                "data_collection": "Not available",
                "preprocessing": "Not available",
                "model_development": "Not available",
                "evaluation": "Not available",
            }

        return {
            "problem_definition": research_problem,
            "data_collection": (
                "Collect a suitable academic dataset related "
                "to the research problem."
            ),
            "preprocessing": (
                "Clean, preprocess, normalize and prepare "
                "the collected data."
            ),
            "model_development": (
                "Develop and train an appropriate AI/ML model "
                "based on the selected research idea."
            ),
            "evaluation": (
                "Evaluate the proposed approach using suitable "
                "performance metrics and compare it with "
                "existing approaches."
            ),
        }