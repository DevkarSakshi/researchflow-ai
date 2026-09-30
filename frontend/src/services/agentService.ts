import { USE_MOCK_DATA, request } from './api';
import {
  mockResearchAgents,
  mockPapers,
  mockComparisonMatrix,
  mockResearchGaps,
  mockSuggestedIdeas,
  mockCitations,
  mockReviewerFeedback,
  mockFinalPlan
} from '../data/mockData';

import type {
  ResearchAgent,
  FinalResearchPlan,
  ResearchPaper,
  ComparisonMatrixRow,
  ResearchGap,
  SuggestedIdea,
  CitationItem,
  ReviewerFeedbackItem
} from '../types';

export const agentService = {

  async getAllAgents(): Promise<ResearchAgent[]> {
    return Promise.resolve(mockResearchAgents);
  },

  async triggerWorkflow(
    query: string
  ): Promise<{ workflowId: string; status: string }> {

    if (USE_MOCK_DATA) {
      return Promise.resolve({
        workflowId: 'wf_mock_' + Date.now(),
        status: 'initiated'
      });
    }

    return request<{ workflowId: string; status: string }>(
      '/research/workflow/start',
      {
        method: 'POST',
        body: JSON.stringify({ query })
      }
    );
  },

  async getPapers(): Promise<ResearchPaper[]> {

    if (USE_MOCK_DATA) {
      return Promise.resolve(mockPapers);
    }

    return request<ResearchPaper[]>('/research/papers');
  },

  async getComparisonMatrix(): Promise<ComparisonMatrixRow[]> {

    if (USE_MOCK_DATA) {
      return Promise.resolve(mockComparisonMatrix);
    }

    return request<ComparisonMatrixRow[]>('/research/comparison');
  },

  async getGapsAndIdeas(): Promise<{
    research_gaps: ResearchGap[];
    research_ideas: SuggestedIdea[];
  }> {

    if (USE_MOCK_DATA) {
      return Promise.resolve({
        research_gaps: mockResearchGaps,
        research_ideas: mockSuggestedIdeas
      });
    }

    return request<{
      research_gaps: ResearchGap[];
      research_ideas: SuggestedIdea[];
    }>('/research/gaps');
  },

  async getMethodology(): Promise<{
    problem_definition: string;
    research_objective: string;
    data_collection: string;
    preprocessing: string;
    baseline_models: string;
    proposed_approach: string;
    training_strategy: string;
    evaluation: string;
    explainability: string;
    expected_outcome: string;
  }> {

    if (USE_MOCK_DATA) {
      return Promise.resolve({
        problem_definition: 'Research problem definition',
        research_objective: 'Research objective',
        data_collection: 'Data collection strategy',
        preprocessing: 'Data preprocessing steps',
        baseline_models: 'Baseline models',
        proposed_approach: 'Proposed approach',
        training_strategy: 'Training strategy',
        evaluation: 'Evaluation metrics and protocol',
        explainability: 'Explainability approach',
        expected_outcome: 'Expected research outcome'
      });
    }

    return request<{
      problem_definition: string;
      research_objective: string;
      data_collection: string;
      preprocessing: string;
      baseline_models: string;
      proposed_approach: string;
      training_strategy: string;
      evaluation: string;
      explainability: string;
      expected_outcome: string;
    }>('/research/methodology');
  },

  async getCitations(): Promise<CitationItem[]> {

    if (USE_MOCK_DATA) {
      return Promise.resolve(mockCitations);
    }

    return request<CitationItem[]>('/research/citations');
  },

  async getReviewerFeedback(): Promise<ReviewerFeedbackItem[]> {

    if (USE_MOCK_DATA) {
      return Promise.resolve(mockReviewerFeedback);
    }

    return request<ReviewerFeedbackItem[]>('/research/reviewer');
  },

  async getAgentStatus(): Promise<{
    agent_status: Record<string, string>;
  }> {

    if (USE_MOCK_DATA) {
      return Promise.resolve({
        agent_status: {
          'Orchestrator': 'pending',
          'Literature Agent': 'pending',
          'Paper Intelligence Agent': 'pending',
          'Comparison Agent': 'pending',
          'Gap Agent': 'pending',
          'Idea Agent': 'pending',
          'Methodology Agent': 'pending',
          'Citation Agent': 'pending',
          'Reviewer Agent': 'pending'
        }
      });
    }

    return request<{
      agent_status: Record<string, string>;
    }>('/research/agent-status');
  },

  async getFinalPlan(): Promise<FinalResearchPlan> {
    return Promise.resolve(mockFinalPlan);
  },

  async submitPlanApproval(
    decision: 'approved' | 'rejected' | 'changes_requested',
    studentNotes?: string
  ): Promise<{
    success: boolean;
    updatedPlan: FinalResearchPlan;
  }> {
    console.log('SUBMIT APPROVAL CALLED:', decision);

    if (USE_MOCK_DATA) {

      mockFinalPlan.humanApprovalStatus = decision;
      mockFinalPlan.studentNotes = studentNotes;
      mockFinalPlan.approvedAt =
        decision === 'approved'
          ? new Date().toISOString()
          : undefined;

      return Promise.resolve({
        success: true,
        updatedPlan: mockFinalPlan
      });
    }

   return request<{
  success: boolean;
  updatedPlan: FinalResearchPlan;
}>('/research/approval', {
  method: 'PATCH',
  body: JSON.stringify({
    approval_status: decision
  })
});
  }
};