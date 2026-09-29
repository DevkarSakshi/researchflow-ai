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

def orchestrator_node(state: ResearchState) -> ResearchState:
    """
    Run the Orchestrator Agent and generate research tasks.
    """

    research_problem = state["research_problem"]

    tasks = orchestrator_agent.create_tasks(
        research_problem
    )

    return {
        **state,
        "tasks": tasks,
    }


def literature_node(state: ResearchState) -> ResearchState:
    """
    Run the Literature Agent and retrieve relevant
    academic research papers.
    """

    research_problem = state["research_problem"]

    papers = literature_agent.search_literature(
        research_problem
    )

    return {
        **state,
        "papers": papers,
    }


def paper_intelligence_node(
    state: ResearchState
) -> ResearchState:
    """
    Run the Paper Intelligence Agent on the first
    retrieved research paper.
    """

    papers = state.get("papers", [])

    if not papers:
        return {
            **state,
            "paper_analysis": [],
        }

    first_paper = papers[0]

    analysis = paper_intelligence_agent.analyze_paper(
        first_paper
    )

    return {
        **state,
        "paper_analysis": [analysis],
    }

def comparison_node(state: ResearchState) -> ResearchState:
    """
    Run the Comparison Agent and create a comparison
    matrix from the retrieved papers.
    """

    papers = state.get("papers", [])
    paper_analysis = state.get("paper_analysis", [])

    comparison = comparison_agent.compare_papers(
        papers,
        paper_analysis
    )

    return {
        **state,
        "comparison": comparison,
    }

def gap_node(state: ResearchState) -> ResearchState:
    """
    Run the Gap Agent and identify research gaps
    from the paper comparison.
    """

    papers = state.get("papers", [])
    comparison = state.get("comparison", [])

    research_gaps = gap_agent.identify_gaps(
        papers,
        comparison
    )

    return {
        **state,
        "research_gaps": research_gaps,
    }

def idea_node(state: ResearchState) -> ResearchState:
    """
    Run the Idea Agent and generate possible
    research directions from identified gaps.
    """

    research_problem = state["research_problem"]
    research_gaps = state.get("research_gaps", [])

    research_ideas = idea_agent.generate_ideas(
        research_problem,
        research_gaps
    )

    return {
        **state,
        "research_ideas": research_ideas,
    }

def methodology_node(state: ResearchState) -> ResearchState:
    """
    Run the Methodology Agent and create a
    structured research methodology.
    """

    research_problem = state["research_problem"]
    research_ideas = state.get("research_ideas", [])

    methodology = methodology_agent.suggest_methodology(
        research_problem,
        research_ideas
    )

    return {
        **state,
        "methodology": methodology,
    }

def citation_node(state: ResearchState) -> ResearchState:
    """
    Run the Citation Agent and organize
    references for the retrieved papers.
    """

    papers = state.get("papers", [])

    citations = citation_agent.organize_citations(
        papers
    )

    return {
        **state,
        "citations": citations,
    }

def reviewer_node(state: ResearchState):
    feedback = reviewer_agent.review_research_plan(
        state["research_problem"],
        state.get("research_gaps", []),
        state.get("research_ideas", []),
        state.get("methodology", {}),
        state.get("citations", [])
    )

    return {
        "reviewer_feedback": feedback
    }

def final_plan_node(state: ResearchState):
    final_plan = final_plan_agent.create_final_plan(
        state["research_problem"],
        state.get("papers", []),
        state.get("comparison", []),
        state.get("research_gaps", []),
        state.get("research_ideas", []),
        state.get("methodology", {}),
        state.get("citations", []),
        state.get("reviewer_feedback", "")
    )

    return {
        "final_research_plan": final_plan
    }

def build_research_workflow():
    graph = StateGraph(ResearchState)

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

    graph.add_edge("reviewer", "final_plan")

    graph.add_edge(
        "final_plan",
        END
    )
  
    return graph.compile()