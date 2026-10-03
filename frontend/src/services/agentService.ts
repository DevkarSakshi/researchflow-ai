import { request } from './api';
import type {
    CitationItem,
    ComparisonMatrixRow,
    FinalResearchPlan,
    MethodologyStep,
    PersistedResearchWorkflow,
    ResearchAgent,
    ResearchGap,
    ResearchHistoryItem,
    ResearchPaper,
    ResearchWorkflowResult,
    ReviewerFeedbackItem,
    SuggestedIdea,
} from '../types';

export interface LatestWorkflowResponse {
    workflow: PersistedResearchWorkflow | null;
}

export interface ResearchHistoryResponse {
    history: ResearchHistoryItem[];
}

export const agentService = {
    getLatestWorkflow(): Promise<LatestWorkflowResponse> {
        return request<LatestWorkflowResponse>('/research/latest');
    },

    getWorkflowById(workflowId: string): Promise<LatestWorkflowResponse> {
        return request<LatestWorkflowResponse>(`/research/${encodeURIComponent(workflowId)}`);
    },

    getResearchHistory(): Promise<ResearchHistoryResponse> {
        return request<ResearchHistoryResponse>('/research/history');
    },

    async getAllAgents(): Promise<ResearchAgent[]> {
        const { workflow } = await this.getLatestWorkflow();
        return getAgentsForWorkflow(workflow);
    },

    async triggerWorkflow(query: string): Promise<{ workflowId: string; status: string }> {
        const response = await request<{ workflow: PersistedResearchWorkflow }>('/research/start', {
            method: 'POST',
            body: JSON.stringify({ research_problem: query, pdfs: [] }),
        });
        return { workflowId: response.workflow.id, status: response.workflow.status };
    },

    async getWorkflow(workflowId?: string): Promise<PersistedResearchWorkflow | null> {
        if (workflowId) {
            const res = await this.getWorkflowById(workflowId);
            return res.workflow;
        }
        const res = await this.getLatestWorkflow();
        return res.workflow;
    },

    async getPapers(workflowId?: string): Promise<ResearchPaper[]> {
        const result = await this.getLatestResult(workflowId);
        if (!result) return [];

        const metadata = new Map<string, Record<string, unknown>>();
        const analyses = new Map<string, Record<string, unknown>>();
        result.papers.forEach(paper => metadata.set(paperIdentity(paper), paper));
        result.paper_analysis.forEach(paper => analyses.set(paperIdentity(paper), paper));
        const identities = new Set([...metadata.keys(), ...analyses.keys()]);

        return [...identities].map(id => {
            const paper = metadata.get(id) ?? {};
            const analysis = analyses.get(id) ?? {};
            return {
                id,
                title: textValue(analysis.title ?? paper.title),
                authors: stringArray(analysis.authors ?? paper.authors),
                year: optionalNumber(analysis.year ?? paper.year),
                venue: textValue(analysis.venue ?? paper.venue),
                summary: textValue(analysis.abstract ?? paper.abstract),
                methodology: textValue(analysis.methodology),
                dataset: textValue(analysis.dataset),
                results: textValue(analysis.results),
                limitations: textValue(analysis.limitations),
                citation: textValue(analysis.doi ?? paper.doi ?? paper.url),
                tags: [],
                doi: optionalString(analysis.doi ?? paper.doi),
                url: optionalString(analysis.url ?? paper.url),
                source: optionalString(analysis.source_type ?? paper.source),
                evidence: Array.isArray(analysis.evidence) ? analysis.evidence : [],
            };
        });
    },

    async getComparisonMatrix(workflowId?: string): Promise<ComparisonMatrixRow[]> {
        const result = await this.getLatestResult(workflowId);
        return (result?.comparison ?? []).map(row => ({
            paperId: textValue(row.paper_id),
            paperTitle: textValue(row.title),
            year: optionalNumber(row.year),
            methodology: textValue(row.methodology),
            dataset: textValue(row.dataset),
            results: textValue(row.results),
            limitations: textValue(row.limitations),
            strengths: textValue(row.contributions),
        }));
    },

    async getGapsAndIdeas(workflowId?: string): Promise<{ gaps: ResearchGap[]; ideas: SuggestedIdea[] }> {
        const result = await this.getLatestResult(workflowId);
        return {
            gaps: (result?.research_gaps ?? []).map(gap => ({
                id: gap.gap_id,
                title: gap.gap_type.replaceAll('_', ' '),
                description: gap.description,
                sourcePaperIds: gap.source_paper_ids,
                sourcePaperTitles: gap.source_paper_titles,
                evidence: gap.evidence,
                gapType: gap.gap_type,
            })),
            ideas: (result?.research_ideas ?? []).map(idea => ({
                id: idea.idea_id,
                title: idea.status.replaceAll('_', ' '),
                coreHypothesis: idea.hypothesis,
                rationale: idea.problem_addressed,
                targetGapId: idea.gap_id,
                recommendedArchitecture: idea.proposed_approach,
                status: idea.status,
                problemAddressed: idea.problem_addressed,
                proposedApproach: idea.proposed_approach,
                expectedContribution: idea.expected_contribution,
                sourcePaperIds: idea.source_paper_ids,
            })),
        };
    },

    async getMethodology(workflowId?: string): Promise<MethodologyStep[]> {
        const result = await this.getLatestResult(workflowId);
        const steps = Array.isArray(result?.methodology.steps) ? result.methodology.steps : [];
        return steps.map((step, index) => ({
            stepNumber: numberValue(step.step_number) || index + 1,
            title: textValue(step.title),
            description: textValue(step.description),
            inputs: stringArray(step.inputs),
            outputs: stringArray(step.outputs),
            recommendedTools: stringArray(step.recommended_tools),
        }));
    },

    async getCitations(workflowId?: string): Promise<CitationItem[]> {
        const result = await this.getLatestResult(workflowId);
        return (result?.citations ?? []).flatMap(citation => (
            [
                { format: 'APA' as const, rawCitation: citation.apa7 },
                { format: 'IEEE' as const, rawCitation: citation.ieee },
                { format: 'BibTeX' as const, rawCitation: citation.bibtex },
            ]
                .filter(item => item.rawCitation)
                .map(item => ({
                    id: `${citation.paper_id}:${item.format}`,
                    paperTitle: citation.title ?? 'Title not reported',
                    authors: citation.authors.join(', '),
                    year: citation.year,
                    format: item.format,
                    rawCitation: item.rawCitation as string,
                }))
        ));
    },

    async getReviewerFeedback(workflowId?: string): Promise<ReviewerFeedbackItem[]> {
        const result = await this.getLatestResult(workflowId);
        return (result?.reviewer_feedback.checks ?? []).map(check => ({
            category: reviewerCategory(check.id),
            severity: check.status === 'passed' ? 'low' : 'high',
            title: check.label,
            detail: check.status === 'passed'
                ? 'Deterministic check passed.'
                : 'This requirement was not established by the available workflow data.',
            actionableSuggestion: check.remediation ?? 'No revision identified by this check.',
        }));
    },

    async getFinalPlan(workflowId?: string): Promise<FinalResearchPlan | null> {
        const workflow = await this.getWorkflow(workflowId);
        if (!workflow?.result) return null;
        const result = workflow.result;
        const plan = result.final_research_plan;
        const idea = result.research_ideas[0];
        const methodology = result.methodology;
        const datasets = [...new Set(
            result.paper_analysis
                .map(paper => paper.dataset)
                .filter(value => value && value !== 'Not reported')
        )];

        return {
            projectId: workflow.id,
            topic: result.research_problem || result.pdfs.map(pdf => pdf.filename).join(', '),
            generatedDate: workflow.created_at ?? '',
            problemStatement: textValue(plan.research_problem ?? result.research_problem),
            novelHypothesis: idea?.hypothesis ?? 'Not available yet',
            methodologySummary: JSON.stringify(methodology),
            datasets,
            deliverables: Array.isArray(methodology.steps)
                ? methodology.steps.flatMap(step => stringArray(step.outputs))
                : [],
            risksAndMitigations: result.reviewer_feedback.concerns.map(check => ({
                risk: check.label,
                mitigation: check.remediation ?? 'Review the source evidence.',
            })),
            humanApprovalStatus: approvalStatus(workflow.approval_status),
        };
    },

    async getLatestResult(workflowId?: string): Promise<ResearchWorkflowResult | null> {
        const workflow = await this.getWorkflow(workflowId);
        return workflow?.result ?? null;
    },


    submitPlanApproval(
        decision: 'approved' | 'rejected' | 'changes_requested',
        studentNotes?: string,
        deadline?: string,
    ): Promise<Record<string, unknown>> {
        return request<Record<string, unknown>>('/research/approval', {
            method: 'PATCH',
            body: JSON.stringify({ approval_status: decision, student_notes: studentNotes, deadline }),
        });
    },
};

const agentDefinitions: ResearchAgent[] = [
    { id: 'orchestrator', name: 'Workflow Orchestrator', role: 'Dispatches deterministic workflow stages.', order: 1, status: 'pending', progress: 0 },
    { id: 'literature', name: 'Literature Agent', role: 'Retrieves provenance-linked sources from Crossref and Semantic Scholar.', order: 2, status: 'pending', progress: 0 },
    { id: 'paper_intelligence', name: 'Paper Intelligence Agent', role: 'Extracts structured fields and evidence from papers.', order: 3, status: 'pending', progress: 0 },
    { id: 'comparison', name: 'Comparison Agent', role: 'Joins structured analysis by paper identity.', order: 4, status: 'pending', progress: 0 },
    { id: 'gap', name: 'Gap Agent', role: 'Reports evidence-linked limitations and unreported dimensions.', order: 5, status: 'pending', progress: 0 },
    { id: 'idea', name: 'Idea Agent', role: 'Creates candidate ideas linked to identified gaps.', order: 6, status: 'pending', progress: 0 },
    { id: 'methodology', name: 'Methodology Agent', role: 'Builds a structured evidence-driven study plan.', order: 7, status: 'pending', progress: 0 },
    { id: 'citation', name: 'Citation Agent', role: 'Formats citations from available source metadata.', order: 8, status: 'pending', progress: 0 },
    { id: 'reviewer', name: 'Reviewer Agent', role: 'Runs deterministic completeness and evidence checks.', order: 9, status: 'pending', progress: 0 },
    { id: 'final_plan', name: 'Final Research Plan Agent', role: 'Aggregates the persisted outputs of preceding stages.', order: 10, status: 'pending', progress: 0 },
];

export function getAgentsForWorkflow(workflow: PersistedResearchWorkflow | null): ResearchAgent[] {
    return agentDefinitions.map(agent => ({
        ...agent,
        status: workflow?.agent_statuses?.[agent.id] ?? 'pending',
        progress: workflow?.agent_statuses?.[agent.id] === 'completed' ? 100 : 0,
        summaryOutput: workflow?.result ? summarizeAgentOutput(workflow.result, agent.id) : undefined,
    }));
}

function paperIdentity(paper: Record<string, unknown>): string {
    return String(paper.paper_id ?? paper.doi ?? paper.url ?? paper.title ?? paper.filename ?? 'unknown-paper');
}

function textValue(value: unknown): string {
    return typeof value === 'string' && value.trim() ? value : 'Not reported';
}

function optionalString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
}

function numberValue(value: unknown): number {
    return typeof value === 'number' ? value : 0;
}

function optionalNumber(value: unknown): number | undefined {
    return typeof value === 'number' ? value : undefined;
}

function stringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function reviewerCategory(id: string): ReviewerFeedbackItem['category'] {
    if (id === 'datasets' || id === 'evaluation' || id === 'baselines') return 'Missing Information';
    if (id === 'methodology' || id === 'source_evidence') return 'Feasibility';
    if (id === 'limitations') return 'Consistency';
    return 'Quality';
}

function approvalStatus(status: string): FinalResearchPlan['humanApprovalStatus'] {
    if (status === 'approved' || status === 'rejected' || status === 'changes_requested') return status;
    return 'pending_review';
}

function summarizeAgentOutput(result: ResearchWorkflowResult, agentId: string): string {
    const outputs: Record<string, unknown> = {
        orchestrator: result.tasks,
        literature: result.papers,
        paper_intelligence: result.paper_analysis,
        comparison: result.comparison,
        gap: result.research_gaps,
        idea: result.research_ideas,
        methodology: result.methodology,
        citation: result.citations,
        reviewer: result.reviewer_feedback,
        final_plan: result.final_research_plan,
    };
    return JSON.stringify(outputs[agentId] ?? {});
}
