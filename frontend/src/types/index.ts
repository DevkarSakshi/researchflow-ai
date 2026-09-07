export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export type ResearchAgentId = 
  | 'orchestrator'
  | 'literature'
  | 'paper_intelligence'
  | 'comparison'
  | 'gap'
  | 'idea'
  | 'methodology'
  | 'citation'
  | 'reviewer';

export interface ResearchAgent {
  id: ResearchAgentId;
  name: string;
  role: string;
  order: number;
  status: AgentStatus;
  progress: number;
  lastUpdated?: string;
  summaryOutput?: string;
  detailedOutput?: any;
  error?: string;
  metrics?: {
    durationSec: number;
    tokensUsed: number;
    itemsProcessed: number;
  };
}

export type AcademicAgentId = 'planner' | 'reminder' | 'analytics' | 'progress_tracker';

export interface AcademicAgent {
  id: AcademicAgentId;
  name: string;
  role: string;
  status: AgentStatus;
  lastSync: string;
  insights: string[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  venue: string;
  summary: string;
  methodology: string;
  dataset: string;
  results: string;
  limitations: string;
  citation: string;
  pdfUrl?: string;
  relevanceScore: number;
  tags: string[];
}

export interface ComparisonMatrixRow {
  paperId: string;
  paperTitle: string;
  year: number;
  methodology: string;
  dataset: string;
  results: string;
  limitations: string;
  strengths: string;
}

export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  impactScore: number;
  feasibilityScore: number;
  sourcePaperIds: string[];
  sourcePaperTitles: string[];
}

export interface SuggestedIdea {
  id: string;
  title: string;
  coreHypothesis: string;
  rationale: string;
  targetGapId: string;
  recommendedArchitecture: string;
  estimatedEffortWeeks: number;
}

export interface MethodologyStep {
  stepNumber: number;
  title: string;
  description: string;
  inputs: string[];
  outputs: string[];
  recommendedTools: string[];
}

export interface CitationItem {
  id: string;
  paperTitle: string;
  authors: string;
  year: number;
  format: 'APA' | 'IEEE' | 'BibTeX';
  rawCitation: string;
}

export interface ReviewerFeedbackItem {
  category: 'Quality' | 'Missing Information' | 'Consistency' | 'Feasibility';
  severity: 'low' | 'medium' | 'high';
  title: string;
  detail: string;
  actionableSuggestion: string;
}

export interface AcademicTask {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'research_milestone' | 'paper_reading';
  courseOrProject: string;
  dueDate: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: AcademicAgentId;
}

export interface AcademicDeadline {
  id: string;
  title: string;
  dueDate: string;
  course: string;
  daysRemaining: number;
  urgent: boolean;
  type: 'exam' | 'submission' | 'milestone';
}

export interface FinalResearchPlan {
  projectId: string;
  topic: string;
  generatedDate: string;
  problemStatement: string;
  novelHypothesis: string;
  methodologySummary: string;
  datasets: string[];
  deliverables: string[];
  risksAndMitigations: { risk: string; mitigation: string }[];
  humanApprovalStatus: 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  studentNotes?: string;
  approvedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  institution: string;
  degree: string;
  department: string;
  currentSemester: string;
  advisor: string;
  gpa: string;
  researchInterests: string[];
  activeProjectName: string;
}
