class OrchestratorAgent:
    """
    Coordinates the research workflow by analyzing
    the student's research problem and creating tasks
    for specialized research agents.
    """

    def create_tasks(self, research_problem: str) -> list[str]:
        """
        Return the stages that make up the deterministic workflow.
        """
        return [
            "Find relevant research literature",
            "Extract and analyze paper content",
            "Compare available evidence",
            "Identify evidence-supported research gaps",
            "Develop candidate research ideas",
            "Construct a research methodology",
            "Format source citations",
            "Run deterministic plan checks",
        ]