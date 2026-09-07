import { USE_MOCK_DATA, request } from './api';
import { 
  mockResearchAgents, 
  mockPapers, 
  mockComparisonMatrix, 
  mockResearchGaps, 
  mockSuggestedIdeas, 
  mockMethodologySteps, 
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
  MethodologyStep, 
  CitationItem, 
  ReviewerFeedbackItem 
} from '../types';

export const agentService = {
  async getAllAgents(): Promise<ResearchAgent[]> {
    if (USE_MOCK_DATA) {
      return Promise.resolve(mockResearchAgents);
    }
    return request<ResearchAgent[]>('/agents/status');
  },

  async triggerWorkflow(query: string): Promise<{ workflowId: string; status: string }> {
    if (USE_MOCK_DATA) {
      return Promise.resolve({
        workflowId: 'wf_mock_' + Date.now(),
        status: 'initiated'
      });
    }
    return request<{ workflowId: string; status: string }>('/research/workflow/start', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  async getPapers(): Promise<ResearchPaper[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockPapers);
    return request<ResearchPaper[]>('/research/papers');
  },

  async getComparisonMatrix(): Promise<ComparisonMatrixRow[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockComparisonMatrix);
    return request<ComparisonMatrixRow[]>('/research/comparison');
  },

  async getGapsAndIdeas(): Promise<{ gaps: ResearchGap[]; ideas: SuggestedIdea[] }> {
    if (USE_MOCK_DATA) return Promise.resolve({ gaps: mockResearchGaps, ideas: mockSuggestedIdeas });
    return request<{ gaps: ResearchGap[]; ideas: SuggestedIdea[] }>('/research/gaps');
  },

  async getMethodology(): Promise<MethodologyStep[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockMethodologySteps);
    return request<MethodologyStep[]>('/research/methodology');
  },

  async getCitations(): Promise<CitationItem[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockCitations);
    return request<CitationItem[]>('/research/citations');
  },

  async getReviewerFeedback(): Promise<ReviewerFeedbackItem[]> {
    if (USE_MOCK_DATA) return Promise.resolve(mockReviewerFeedback);
    return request<ReviewerFeedbackItem[]>('/research/reviewer');
  },

  async getFinalPlan(): Promise<FinalResearchPlan> {
    if (USE_MOCK_DATA) return Promise.resolve(mockFinalPlan);
    return request<FinalResearchPlan>('/research/plan');
  },

  async submitPlanApproval(
    decision: 'approved' | 'rejected' | 'changes_requested', 
    studentNotes?: string
  ): Promise<{ success: boolean; updatedPlan: FinalResearchPlan }> {
    if (USE_MOCK_DATA) {
      mockFinalPlan.humanApprovalStatus = decision;
      mockFinalPlan.studentNotes = studentNotes;
      mockFinalPlan.approvedAt = decision === 'approved' ? new Date().toISOString() : undefined;
      return Promise.resolve({ success: true, updatedPlan: mockFinalPlan });
    }
    return request<{ success: boolean; updatedPlan: FinalResearchPlan }>('/research/plan/approval', {
      method: 'POST',
      body: JSON.stringify({ decision, studentNotes })
    });
  }
};
