import logging
from collections.abc import Callable

from langgraph.graph import END, START, StateGraph

from agents.comparison.comparison import ComparisonAgent
from agents.gap.gap import GapAgent
from agents.idea.idea import IdeaAgent
from agents.methodology.methodology import MethodologyAgent
from agents.citation.citation import CitationAgent
from agents.reviewer.reviewer import ReviewerAgent
from agents.literature.literature import LiteratureAgent
from agents.orchestrator.orchestrator import OrchestratorAgent
from agents.paper_intelligence.paper_intelligence import PaperIntelligenceAgent
from agents.state import ResearchState
from agents.final_plan import FinalResearchPlanAgent


orchestrator_agent = OrchestratorAgent()
literature_agent = LiteratureAgent()
paper_intelligence_agent = PaperIntelligenceAgent()
comparison_agent = ComparisonAgent()
gap_agent = GapAgent()
idea_agent = IdeaAgent()
methodology_agent = MethodologyAgent()
citation_agent = CitationAgent()
reviewer_agent = ReviewerAgent()
final_plan_agent = FinalResearchPlanAgent()
logger = logging.getLogger(__name__)


def orchestrator_node(state: ResearchState) -> ResearchState:
    """
    Analyze the user's research input and create research tasks.
    """

    research_problem = state.get("research_problem", "").strip()
    pdfs = state.get("pdfs", [])

    # Give the orchestrator enough context to understand
    # whether the user provided a topic, PDFs, or both.
    if research_problem and pdfs:
        context = (
            f"Research topic/problem:\n{research_problem}\n\n"
            f"User uploaded {len(pdfs)} PDF(s). "
            "The uploaded papers must be incorporated into the research workflow."
        )

    elif pdfs:
        context = (
            f"The user uploaded {len(pdfs)} research PDF(s). "
            "Analyze the uploaded papers as the primary research input."
        )

    else:
        context = research_problem

    tasks = orchestrator_agent.create_tasks(context)

    return {
        **state,
        "tasks": tasks,
    }


def literature_node(state: ResearchState) -> ResearchState:
    """
    Retrieve web literature only when it is useful for the user's input.

    PDF-only research should primarily use the uploaded papers.
    Topic-only research should use web literature.
    Topic + PDF research can use both.
    """

    research_problem = state.get("research_problem", "").strip()
    # If the user supplied a topic, search the literature for it.
    if research_problem:
        literature_result = literature_agent.search_literature_with_status(
            research_problem
        )
        papers = literature_result["papers"]
        literature_sources = literature_result["sources"]
    else:
        papers = []
        literature_sources = []
    literature_status = (
        "failed"
        if research_problem
        and not papers
        and literature_sources
        and all(source.get("status") == "failed" for source in literature_sources)
        else "completed"
    )

    return {
        **state,
        "papers": papers,
        "literature_sources": literature_sources,
        "agent_statuses": {
            **state.get("agent_statuses", {}),
            "literature": literature_status,
        },
    }


def paper_intelligence_node(state: ResearchState) -> ResearchState:
    """
    Analyze uploaded PDFs and/or retrieved research papers.

    Every available paper is considered instead of analyzing
    only the first paper.
    """

    pdfs = state.get("pdfs", [])
    papers = state.get("papers", [])

    paper_inputs = []

    # Uploaded PDFs are primary user-provided evidence.
    for pdf in pdfs:
        paper_inputs.append(
            {
                **pdf,
                "source_type": "uploaded_pdf",
            }
        )

    # Add web-retrieved papers.
    for paper in papers:
        paper_inputs.append(
            {
                **paper,
                "source_type": "web_research",
            }
        )

    if not paper_inputs:
        return {
            **state,
            "paper_analysis": [],
        }

    analyses = []

    for paper in paper_inputs:
        try:
            analysis = paper_intelligence_agent.analyze_paper(
                paper
            )

            analyses.append(
                {
                    **analysis,
                    "source_type": paper.get(
                        "source_type",
                        "unknown",
                    ),
                }
            )

        except Exception as error:
            analyses.append(
                {
                    "source": paper.get(
                        "title",
                        paper.get(
                            "filename",
                            "Unknown paper",
                        ),
                    ),
                    "source_type": paper.get(
                        "source_type",
                        "unknown",
                    ),
                    "error": str(error),
                }
            )

    return {
        **state,
        "paper_analysis": analyses,
    }


def comparison_node(state: ResearchState) -> ResearchState:
    """
    Compare the available research evidence.

    Possible inputs:

    1. Multiple uploaded PDFs
       -> compare uploaded PDFs with each other.

    2. One uploaded PDF + research topic
       -> compare the uploaded paper with retrieved literature.

    3. Topic only
       -> compare retrieved research papers.

    4. One PDF only
       -> analyze the uploaded paper without inventing
          unrelated comparison papers.
    """

    papers = state.get("papers", [])
    pdfs = state.get("pdfs", [])
    paper_analysis = state.get("paper_analysis", [])

    comparison_inputs = []

    for pdf in pdfs:
        comparison_inputs.append(
            {
                **pdf,
                "source_type": "uploaded_pdf",
            }
        )

    for paper in papers:
        comparison_inputs.append(
            {
                **paper,
                "source_type": "web_research",
            }
        )

    # Nothing available to compare.
    if not comparison_inputs:
        return {
            **state,
            "comparison": [],
        }

    comparison = comparison_agent.compare_papers(
        comparison_inputs,
        paper_analysis,
    )

    return {
        **state,
        "comparison": comparison,
    }


def gap_node(state: ResearchState) -> ResearchState:
    """
    Identify research gaps from the available evidence.
    """

    papers = state.get("papers", [])
    pdfs = state.get("pdfs", [])
    comparison = state.get("comparison", [])

    gap_inputs = []

    for pdf in pdfs:
        gap_inputs.append(
            {
                **pdf,
                "source_type": "uploaded_pdf",
            }
        )

    for paper in papers:
        gap_inputs.append(
            {
                **paper,
                "source_type": "web_research",
            }
        )

    research_gaps = gap_agent.identify_gaps(
        gap_inputs,
        comparison,
        state.get("paper_analysis", []),
    )

    return {
        **state,
        "research_gaps": research_gaps,
    }


def idea_node(state: ResearchState) -> ResearchState:
    """
    Generate research ideas strictly from the identified gaps.
    """

    research_problem = state.get(
        "research_problem",
        "",
    )

    research_gaps = state.get(
        "research_gaps",
        [],
    )

    research_ideas = idea_agent.generate_ideas(
        research_problem,
        research_gaps,
    )

    return {
        **state,
        "research_ideas": research_ideas,
    }


def methodology_node(state: ResearchState) -> ResearchState:
    """
    Create a structured methodology from the research problem
    and gap-derived ideas.
    """

    research_problem = state.get(
        "research_problem",
        "",
    )

    research_ideas = state.get(
        "research_ideas",
        [],
    )

    methodology = methodology_agent.suggest_methodology(
        research_problem,
        research_ideas,
        state.get("paper_analysis", []),
        state.get("comparison", []),
    )

    return {
        **state,
        "methodology": methodology,
    }


def citation_node(state: ResearchState) -> ResearchState:
    """
    Organize citations from both uploaded and web papers.
    """

    papers = state.get("papers", [])
    pdfs = state.get("pdfs", [])

    citation_inputs = []

    for pdf in pdfs:
        citation_inputs.append(
            {
                **pdf,
                "source_type": "uploaded_pdf",
            }
        )

    for paper in papers:
        citation_inputs.append(
            {
                **paper,
                "source_type": "web_research",
            }
        )

    citations = citation_agent.organize_citations(
        citation_inputs
    )

    return {
        **state,
        "citations": citations,
    }


def reviewer_node(state: ResearchState) -> ResearchState:
    """
    Review the current research plan using all available evidence.
    """

    reviewer_feedback = reviewer_agent.review_research_plan(
        state.get("research_problem", ""),
        state.get("research_gaps", []),
        state.get("research_ideas", []),
        state.get("methodology", {}),
        state.get("citations", []),
        state.get("paper_analysis", []),
        state.get("comparison", []),
    )

    return {
        **state,
        "reviewer_feedback": reviewer_feedback,
    }


def final_plan_node(state: ResearchState) -> ResearchState:
    """
    Generate the final research plan from all completed stages.
    """

    final_plan = final_plan_agent.create_final_plan(
        state.get("research_problem", ""),
        state.get("papers", []),
        state.get("comparison", []),
        state.get("research_gaps", []),
        state.get("research_ideas", []),
        state.get("methodology", {}),
        state.get("citations", []),
        state.get("reviewer_feedback", ""),
        state.get("paper_analysis", []),
        state.get("tasks", []),
        state.get("agent_statuses", {}),
    )

    return {
        **state,
        "final_research_plan": final_plan,
    }


def _track_agent(
    agent_id: str,
    node,
    status_callback: Callable[[str, str], None] | None,
):
    def tracked_node(state: ResearchState) -> ResearchState:
        statuses = {**state.get("agent_statuses", {}), agent_id: "running"}
        if status_callback:
            try:
                status_callback(agent_id, "running")
            except Exception:
                logger.exception("Could not persist running status for %s", agent_id)

        try:
            result = node({**state, "agent_statuses": statuses})
        except Exception:
            statuses[agent_id] = "failed"
            if status_callback:
                try:
                    status_callback(agent_id, "failed")
                except Exception:
                    logger.exception("Could not persist failed status for %s", agent_id)
            raise

        statuses = {
            **state.get("agent_statuses", {}),
            **result.get("agent_statuses", {}),
        }
        stage_status = "failed" if statuses.get(agent_id) == "failed" else "completed"
        statuses[agent_id] = stage_status
        if agent_id == "final_plan":
            final_plan = result.get("final_research_plan")
            if isinstance(final_plan, dict):
                result["final_research_plan"] = {
                    **final_plan,
                    "agent_statuses": statuses,
                }
        if status_callback:
            try:
                status_callback(agent_id, stage_status)
            except Exception:
                logger.exception("Could not persist %s status for %s", stage_status, agent_id)
        return {**result, "agent_statuses": statuses}

    return tracked_node


def build_research_workflow(
    status_callback: Callable[[str, str], None] | None = None,
):
    """
    Build the complete ResearchFlow AI research pipeline.
    """

    graph = StateGraph(ResearchState)

    graph.add_node(
        "orchestrator",
        _track_agent("orchestrator", orchestrator_node, status_callback),
    )

    graph.add_node(
        "literature",
        _track_agent("literature", literature_node, status_callback),
    )

    graph.add_node(
        "paper_intelligence",
        _track_agent("paper_intelligence", paper_intelligence_node, status_callback),
    )

    graph.add_node(
        "comparison",
        _track_agent("comparison", comparison_node, status_callback),
    )

    graph.add_node(
        "gap",
        _track_agent("gap", gap_node, status_callback),
    )

    graph.add_node(
        "idea",
        _track_agent("idea", idea_node, status_callback),
    )

    graph.add_node(
        "methodology",
        _track_agent("methodology", methodology_node, status_callback),
    )

    graph.add_node(
        "citation",
        _track_agent("citation", citation_node, status_callback),
    )

    graph.add_node(
        "reviewer",
        _track_agent("reviewer", reviewer_node, status_callback),
    )

    graph.add_node(
        "final_plan",
        _track_agent("final_plan", final_plan_node, status_callback),
    )

    graph.add_edge(
        START,
        "orchestrator",
    )

    graph.add_edge(
        "orchestrator",
        "literature",
    )

    graph.add_edge(
        "literature",
        "paper_intelligence",
    )

    graph.add_edge(
        "paper_intelligence",
        "comparison",
    )

    graph.add_edge(
        "comparison",
        "gap",
    )

    graph.add_edge(
        "gap",
        "idea",
    )

    graph.add_edge(
        "idea",
        "methodology",
    )

    graph.add_edge(
        "methodology",
        "citation",
    )

    graph.add_edge(
        "citation",
        "reviewer",
    )

    graph.add_edge(
        "reviewer",
        "final_plan",
    )

    graph.add_edge(
        "final_plan",
        END,
    )

    return graph.compile()