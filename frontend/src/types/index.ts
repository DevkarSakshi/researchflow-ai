export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ResearchEvidence {
  field: string;
  excerpt: string;
  pages: number[];
}

export interface PaperAnalysis {
  [key: string]: unknown;
  paper_id: string;
  source_type: 'uploaded_pdf' | 'web_research' | string;
  title: string;
  authors: string[];
  year?: number | null;
  venue?: string | null;
  doi?: string | null;
  url?: string | null;
  abstract: string;
  methodology: string;
  dataset: string;
  models_or_techniques: string[];
  experiments: string;
  evaluation_metrics: string[];
  results: string;
  key_findings: string[];
  limitations: string;
  research_problem: string;
  contributions: string;
  evidence: ResearchEvidence[];
  analysis_method: string;
}

export interface LiteratureSourceStatus {
  name: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface WorkflowResearchGap {
  gap_id: string;
  gap_type: string;
  description: string;
  source_paper_ids: string[];
  source_paper_titles: string[];
  evidence: ResearchEvidence[];
}

export interface WorkflowResearchIdea {
  idea_id: string;
  status: string;
  hypothesis: string;
  problem_addressed: string;
  motivation: ResearchEvidence[];
  proposed_approach: string;
  expected_contribution: string;
  gap_id: string;
  source_paper_ids: string[];
  research_problem: string;
}

export interface WorkflowCitation {
  paper_id: string;
  title: string | null;
  authors: string[];
  year: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  source: string | null;
  status: 'complete' | 'incomplete_metadata';
  apa7: string | null;
  ieee: string | null;
  bibtex: string | null;
}

export interface ReviewerCheck {
  id: string;
  label: string;
  status: 'passed' | 'needs_attention';
  remediation: string | null;
}

export interface ReviewerReport {
  status: string;
  checks: ReviewerCheck[];
  strengths: string[];
  concerns: ReviewerCheck[];
  required_revisions: string[];
  questions_for_researcher: string[];
  score: null;
  method: string;
}

export interface ResearchWorkflowResult {
  research_problem: string;
  pdfs: { filename: string; paper_id: string; size_bytes: number; page_count: number }[];
  status: string;
  approval_status: string;
  agent_statuses: Record<string, AgentStatus>;
  literature_sources: LiteratureSourceStatus[];
  tasks: string[];
  papers: Record<string, unknown>[];
  paper_analysis: PaperAnalysis[];
  comparison: Record<string, unknown>[];
  research_gaps: WorkflowResearchGap[];
  research_ideas: WorkflowResearchIdea[];
  methodology: Record<string, unknown>;
  citations: WorkflowCitation[];
  reviewer_feedback: ReviewerReport;
  final_research_plan: Record<string, unknown>;
}

export interface PersistedResearchWorkflow {
  id: string;
  research_problem: string;
  pdfs: ResearchWorkflowResult['pdfs'];
  status: string;
  approval_status: string;
  agent_statuses: Record<string, AgentStatus>;
  result?: ResearchWorkflowResult;
  error?: string;
  created_at?: string;
}

export interface ResearchHistoryItem {
  id: string;
  research_problem: string;
  status: string;
  approval_status: string;
  paper_count: number;
  created_at?: string | null;
  has_final_plan: boolean;
}


export type ResearchAgentId =
  | 'orchestrator'
  | 'literature'
  | 'paper_intelligence'
  | 'comparison'
  | 'gap'
  | 'idea'
  | 'methodology'
  | 'citation'
  | 'reviewer'
  | 'final_plan';

export interface ResearchAgent {
  id: ResearchAgentId;
  name: string;
  role: string;
  order: number;
  status: AgentStatus;
  progress: number;
  lastUpdated?: string;
  summaryOutput?: string;
  detailedOutput?: unknown;
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
  year?: number | null;
  venue: string;
  summary: string;
  methodology: string;
  dataset: string;
  results: string;
  limitations: string;
  citation: string;
  pdfUrl?: string;
  relevanceScore?: number;
  tags?: string[];
  doi?: string;
  url?: string;
  source?: string;
  evidence?: ResearchEvidence[];
}

export interface ComparisonMatrixRow {
  paperId: string;
  paperTitle: string;
  year?: number | null;
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
  impactScore?: number;
  feasibilityScore?: number;
  sourcePaperIds: string[];
  sourcePaperTitles: string[];
  gapType?: string;
  evidence?: ResearchEvidence[];
}

export interface SuggestedIdea {
  id: string;
  title: string;
  coreHypothesis: string;
  rationale: string;
  targetGapId: string;
  recommendedArchitecture: string;
  estimatedEffortWeeks?: number;
  status?: string;
  problemAddressed?: string;
  proposedApproach?: string;
  expectedContribution?: string;
  sourcePaperIds?: string[];
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
  year: number | null;
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
  description: string;
  course_or_project: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  dependencies: string[];
  source_section?: string;
  reason: string;
  assignedAgent?: AcademicAgentId;
}

export type AcademicTaskInput = Pick<AcademicTask, 'title' | 'description' | 'type' | 'course_or_project' | 'end_date' | 'priority'>;

export interface AcademicProgress {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  progress_percentage: number;
  current_task: string | null;
  next_task: string | null;
  remaining_tasks: number;
  completed_milestones: number;
  total_milestones: number;
}

export interface AcademicAnalytics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  overdue_rate: number;
  project_status: string;
  total_project_days: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
  completed_milestones: number;
  total_milestones: number;
}

export interface AcademicReminder {
  task_id?: string;
  task: string;
  type: 'overdue' | 'due_today' | 'due_soon' | 'upcoming';
  message: string;
  days_remaining: number;
}

export interface AcademicProject {
  id: string;
  research_workflow_id: string;
  research_topic: string;
  deadline: string;
  schedule_risk: boolean;
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
  researchFlowId: string;
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
  bio?: string;
}

