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


# ---------------------------------------------------------
# ACTUAL AGENT STATUS
# ---------------------------------------------------------

AGENT_STATUS = {
    "Orchestrator": "pending",
    "Literature Agent": "pending",
    "Paper Intelligence Agent": "pending",
    "Comparison Agent": "pending",
    "Gap Agent": "pending",
    "Idea Agent": "pending",
    "Methodology Agent": "pending",
    "Citation Agent": "pending",
    "Reviewer Agent": "pending",
}


def set_agent_status(
    agent_name: str,
    status: str
):
    AGENT_STATUS[agent_name] = status

    print(
        f">>> {agent_name}: {status.upper()} <<<"
    )


def reset_agent_status():
    for agent_name in AGENT_STATUS:
        AGENT_STATUS[agent_name] = "pending"


# ---------------------------------------------------------
# AGENTS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# ORCHESTRATOR
# ---------------------------------------------------------

def orchestrator_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Orchestrator",
        "running"
    )

    research_problem = state[
        "research_problem"
    ]

    tasks = orchestrator_agent.create_tasks(
        research_problem
    )

    set_agent_status(
        "Orchestrator",
        "completed"
    )

    return {
        **state,
        "tasks": tasks,
        "agent_status": {
            **state.get("agent_status", {}),
            "Orchestrator": "completed",
        },
    }


# ---------------------------------------------------------
# LITERATURE
# ---------------------------------------------------------

def literature_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Literature Agent",
        "running"
    )

    research_problem = state[
        "research_problem"
    ]

    papers = literature_agent.search_literature(
        research_problem
    )

    set_agent_status(
        "Literature Agent",
        "completed"
    )

    return {
        **state,
        "papers": papers,
        "agent_status": {
            **state.get("agent_status", {}),
            "Literature Agent": "completed",
        },
    }


# ---------------------------------------------------------
# PAPER INTELLIGENCE
# ---------------------------------------------------------

def paper_intelligence_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Paper Intelligence Agent",
        "running"
    )

    papers = state.get(
        "papers",
        []
    )

    if not papers:

        set_agent_status(
            "Paper Intelligence Agent",
            "completed"
        )

        return {
            **state,
            "paper_analysis": [],
            "agent_status": {
                **state.get(
                    "agent_status",
                    {}
                ),
                "Paper Intelligence Agent":
                    "completed",
            },
        }

    paper_analysis = []

    for paper in papers:

        analysis = (
            paper_intelligence_agent
            .analyze_paper(paper)
        )

        paper_analysis.append(
            analysis
        )

    set_agent_status(
        "Paper Intelligence Agent",
        "completed"
    )

    return {
        **state,
        "paper_analysis":
            paper_analysis,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Paper Intelligence Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# COMPARISON
# ---------------------------------------------------------

def comparison_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Comparison Agent",
        "running"
    )

    papers = state.get(
        "papers",
        []
    )

    paper_analysis = state.get(
        "paper_analysis",
        []
    )

    comparison = (
        comparison_agent.compare_papers(
            papers,
            paper_analysis
        )
    )

    set_agent_status(
        "Comparison Agent",
        "completed"
    )

    return {
        **state,
        "comparison": comparison,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Comparison Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# GAP
# ---------------------------------------------------------

def gap_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Gap Agent",
        "running"
    )

    papers = state.get(
        "papers",
        []
    )

    comparison = state.get(
        "comparison",
        []
    )

    research_gaps = (
        gap_agent.identify_gaps(
            papers,
            comparison
        )
    )

    set_agent_status(
        "Gap Agent",
        "completed"
    )

    return {
        **state,
        "research_gaps":
            research_gaps,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Gap Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# IDEA
# ---------------------------------------------------------

def idea_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Idea Agent",
        "running"
    )

    research_problem = state[
        "research_problem"
    ]

    research_gaps = state.get(
        "research_gaps",
        []
    )

    research_ideas = (
        idea_agent.generate_ideas(
            research_problem,
            research_gaps
        )
    )

    set_agent_status(
        "Idea Agent",
        "completed"
    )

    return {
        **state,
        "research_ideas":
            research_ideas,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Idea Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# METHODOLOGY
# ---------------------------------------------------------

def methodology_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Methodology Agent",
        "running"
    )

    research_problem = state[
        "research_problem"
    ]

    research_ideas = state.get(
        "research_ideas",
        []
    )

    methodology = (
        methodology_agent
        .suggest_methodology(
            research_problem,
            research_ideas
        )
    )

    set_agent_status(
        "Methodology Agent",
        "completed"
    )

    return {
        **state,
        "methodology":
            methodology,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Methodology Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# CITATION
# ---------------------------------------------------------

def citation_node(
    state: ResearchState
) -> ResearchState:

    set_agent_status(
        "Citation Agent",
        "running"
    )

    papers = state.get(
        "papers",
        []
    )

    citations = (
        citation_agent.organize_citations(
            papers
        )
    )

    set_agent_status(
        "Citation Agent",
        "completed"
    )

    return {
        **state,
        "citations": citations,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Citation Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# REVIEWER
# ---------------------------------------------------------

def reviewer_node(
    state: ResearchState
):

    set_agent_status(
        "Reviewer Agent",
        "running"
    )

    feedback = (
        reviewer_agent.review_research_plan(
            state["research_problem"],
            state.get(
                "research_gaps",
                []
            ),
            state.get(
                "research_ideas",
                []
            ),
            state.get(
                "methodology",
                {}
            ),
            state.get(
                "citations",
                []
            )
        )
    )

    set_agent_status(
        "Reviewer Agent",
        "completed"
    )

    return {
        **state,
        "reviewer_feedback":
            feedback,
        "agent_status": {
            **state.get(
                "agent_status",
                {}
            ),
            "Reviewer Agent":
                "completed",
        },
    }


# ---------------------------------------------------------
# FINAL PLAN
# ---------------------------------------------------------

def final_plan_node(
    state: ResearchState
):

    final_plan = (
        final_plan_agent.create_final_plan(
            state["research_problem"],
            state.get(
                "papers",
                []
            ),
            state.get(
                "comparison",
                []
            ),
            state.get(
                "research_gaps",
                []
            ),
            state.get(
                "research_ideas",
                []
            ),
            state.get(
                "methodology",
                {}
            ),
            state.get(
                "citations",
                []
            ),
            state.get(
                "reviewer_feedback",
                ""
            )
        )
    )

    return {
        **state,
        "final_research_plan":
            final_plan,
    }


# ---------------------------------------------------------
# BUILD WORKFLOW
# ---------------------------------------------------------

def build_research_workflow():

    reset_agent_status()

    graph = StateGraph(
        ResearchState
    )

    graph.add_node(
        "orchestrator",
        orchestrator_node
    )

    graph.add_node(
        "literature",
        literature_node
    )

    graph.add_node(
        "paper_intelligence",
        paper_intelligence_node
    )

    graph.add_node(
        "comparison",
        comparison_node
    )

    graph.add_node(
        "gap",
        gap_node
    )

    graph.add_node(
        "idea",
        idea_node
    )

    graph.add_node(
        "methodology",
        methodology_node
    )

    graph.add_node(
        "citation",
        citation_node
    )

    graph.add_node(
        "reviewer",
        reviewer_node
    )

    graph.add_node(
        "final_plan",
        final_plan_node
    )

    # -----------------------------------------------------
    # WORKFLOW ORDER
    # -----------------------------------------------------

    graph.add_edge(
        START,
        "orchestrator"
    )

    graph.add_edge(
        "orchestrator",
        "literature"
    )

    graph.add_edge(
        "literature",
        "paper_intelligence"
    )

    graph.add_edge(
        "paper_intelligence",
        "comparison"
    )

    graph.add_edge(
        "comparison",
        "gap"
    )

    graph.add_edge(
        "gap",
        "idea"
    )

    graph.add_edge(
        "idea",
        "methodology"
    )

    graph.add_edge(
        "methodology",
        "citation"
    )

    graph.add_edge(
        "citation",
        "reviewer"
    )

    graph.add_edge(
        "reviewer",
        "final_plan"
    )

    graph.add_edge(
        "final_plan",
        END
    )

    return graph.compile()