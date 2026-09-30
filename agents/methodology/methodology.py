class MethodologyAgent:
    """
    Methodology Agent responsible for proposing
    a research methodology based on research ideas.
    """

    def suggest_methodology(
        self,
        research_problem: str,
        research_ideas: list[dict],
        paper_analysis: list[dict] | None = None,
        comparison: list[dict] | None = None,
    ) -> dict:
        """
        Suggest a structured research methodology.
        """

        analyses = paper_analysis or []
        comparisons = comparison or []
        if not research_ideas and not analyses:
            return {
                "status": "pending",
                "problem_definition": research_problem,
                "steps": [],
            }

        datasets = sorted({
            str(item.get("dataset"))
            for item in analyses
            if item.get("dataset") and item.get("dataset") != "Not reported"
        })
        metrics = sorted({
            metric
            for item in analyses
            for metric in item.get("evaluation_metrics", [])
        })
        baselines = [
            row.get("results")
            for row in comparisons
            if row.get("results") and row.get("results") != "Not reported"
        ]
        cited_sources = [
            item.get("paper_id")
            for item in analyses
            if item.get("paper_id")
        ]
        approach = research_ideas[0].get("proposed_approach") if research_ideas else None
        steps = [
            {
                "step_number": 1,
                "title": "Define the research question",
                "description": research_problem or "Not available yet",
                "inputs": ["Research problem", *cited_sources],
                "outputs": ["Operational research question"],
                "recommended_tools": [],
            },
            {
                "step_number": 2,
                "title": "Specify evidence and data",
                "description": "Use only datasets reported in the analyzed sources; select and document new data before evaluation.",
                "inputs": datasets or ["Dataset not reported in available sources"],
                "outputs": ["Documented data source and inclusion criteria"],
                "recommended_tools": [],
            },
            {
                "step_number": 3,
                "title": "Execute the proposed study",
                "description": approach or "Select a study approach after reviewing the available evidence.",
                "inputs": [idea.get("hypothesis", "") for idea in research_ideas],
                "outputs": ["Protocol and recorded results"],
                "recommended_tools": [],
            },
            {
                "step_number": 4,
                "title": "Evaluate and validate",
                "description": "Use reported metrics where available and document any newly selected metrics and baselines.",
                "inputs": metrics or ["Evaluation metrics not reported in available sources"],
                "outputs": ["Evaluation results and limitations"],
                "recommended_tools": [],
            },
        ]
        return {
            "status": "draft",
            "problem_definition": research_problem,
            "research_design": "Evidence-driven study plan; design selection remains pending researcher review.",
            "datasets": datasets,
            "data_collection": "Not reported in the analyzed sources" if not datasets else datasets,
            "preprocessing": "Not reported in the analyzed sources",
            "analysis": approach or "Not available yet",
            "baselines": baselines,
            "evaluation_metrics": metrics,
            "validation": "Document protocol, data splits, and limitations before drawing conclusions.",
            "ablation_study": "Not specified by the available evidence",
            "reproducibility": "Record source versions, data provenance, protocol, and analysis code.",
            "source_paper_ids": cited_sources,
            "steps": steps,
        }