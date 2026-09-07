import type { 
  UserProfile, 
  ResearchAgent, 
  AcademicAgent, 
  ResearchPaper, 
  ComparisonMatrixRow, 
  ResearchGap, 
  SuggestedIdea, 
  MethodologyStep, 
  CitationItem, 
  ReviewerFeedbackItem, 
  AcademicTask, 
  AcademicDeadline, 
  FinalResearchPlan 
} from '../types';

export const mockUser: UserProfile = {
  id: 'usr_9021',
  fullName: 'Aishwari Sharma',
  email: 'aishwari.s@cs.university.edu',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  institution: 'Stanford School of Engineering',
  degree: 'M.S. in Computer Science',
  department: 'Artificial Intelligence & Machine Learning Lab',
  currentSemester: 'Term 3 (Fall 2026)',
  advisor: 'Prof. Elena Rostova',
  gpa: '3.92 / 4.00',
  researchInterests: [
    'Autonomous Multi-Agent Systems',
    'Retrieval-Augmented Generation (RAG)',
    'Self-Reflective Reasoning in LLMs',
    'Graph Neural Networks for Scientific Discovery'
  ],
  activeProjectName: 'ResearchFlow: Adaptive Multi-Agent Orchestration for Academic Synthesis'
};

export const mockResearchAgents: ResearchAgent[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator Agent',
    role: 'Deconstructs research query, coordinates downstream agents, manages context & consensus',
    order: 1,
    status: 'completed',
    progress: 100,
    lastUpdated: '10 mins ago',
    summaryOutput: 'Synthesized research query into 4 sub-hypotheses, decomposed pipeline tasks, and assigned tasks to Literature & Intelligence agents.',
    metrics: { durationSec: 3.4, tokensUsed: 2150, itemsProcessed: 1 }
  },
  {
    id: 'literature',
    name: 'Literature Agent',
    role: 'Queries arXiv, Semantic Scholar, and OpenAlex for top-ranked peer-reviewed papers',
    order: 2,
    status: 'completed',
    progress: 100,
    lastUpdated: '8 mins ago',
    summaryOutput: 'Retrieved 84 candidate publications; filtered down to 14 high-impact papers across NeurIPS, ICML, and ACL with >88% semantic relevance.',
    metrics: { durationSec: 12.1, tokensUsed: 14200, itemsProcessed: 84 }
  },
  {
    id: 'paper_intelligence',
    name: 'Paper Intelligence Agent',
    role: 'Deep-extracts methodology, datasets, empirical benchmarks, and structural claims',
    order: 3,
    status: 'completed',
    progress: 100,
    lastUpdated: '6 mins ago',
    summaryOutput: 'Parsed 14 PDFs. Extracted 8 core architectures, 6 benchmark datasets (HotpotQA, GSM8K, SciQ), and quantified evaluation margins.',
    metrics: { durationSec: 24.8, tokensUsed: 42100, itemsProcessed: 14 }
  },
  {
    id: 'comparison',
    name: 'Comparison Agent',
    role: 'Builds cross-paper evaluation matrix matching architectures, datasets, and weaknesses',
    order: 4,
    status: 'completed',
    progress: 100,
    lastUpdated: '5 mins ago',
    summaryOutput: 'Generated 5x5 comparative matrix contrasting single-pass RAG vs. recursive agent verification architectures.',
    metrics: { durationSec: 8.2, tokensUsed: 9800, itemsProcessed: 5 }
  },
  {
    id: 'gap',
    name: 'Gap Agent',
    role: 'Identifies unaddressed trade-offs, dataset biases, and theoretical blindspots',
    order: 5,
    status: 'completed',
    progress: 100,
    lastUpdated: '4 mins ago',
    summaryOutput: 'Isolated 3 critical gaps: Latency explosion in recursive verification, catastrophic forgetting in multi-turn RAG, and lack of human-in-the-loop consensus gates.',
    metrics: { durationSec: 7.6, tokensUsed: 11200, itemsProcessed: 3 }
  },
  {
    id: 'idea',
    name: 'Idea Agent',
    role: 'Formulates novel hypotheses and actionable architectures targeting uncovered gaps',
    order: 6,
    status: 'completed',
    progress: 100,
    lastUpdated: '3 mins ago',
    summaryOutput: 'Formulated "Hierarchical Speculative Verification (HSV)", reducing token overhead by 41% using lightweight draft agents before calling foundation models.',
    metrics: { durationSec: 9.3, tokensUsed: 13400, itemsProcessed: 2 }
  },
  {
    id: 'methodology',
    name: 'Methodology Agent',
    role: 'Designs mathematical formalisms, experimental steps, and ablation study plans',
    order: 7,
    status: 'completed',
    progress: 100,
    lastUpdated: '2 mins ago',
    summaryOutput: 'Drafted 5-phase experimental execution protocol with mathematical formalization for agent consensus thresholding.',
    metrics: { durationSec: 11.5, tokensUsed: 18900, itemsProcessed: 5 }
  },
  {
    id: 'citation',
    name: 'Citation Agent',
    role: 'Formats bibliography, verifies source provenance, and checks reference integrity',
    order: 8,
    status: 'completed',
    progress: 100,
    lastUpdated: '1 min ago',
    summaryOutput: 'Compiled verified BibTeX, APA-7, and IEEE reference entries with 100% DOI cross-matching.',
    metrics: { durationSec: 4.1, tokensUsed: 6200, itemsProcessed: 14 }
  },
  {
    id: 'reviewer',
    name: 'Reviewer Agent',
    role: 'Conducts simulated peer review, assesses rigor, spots edge-case failures, and flags risks',
    order: 9,
    status: 'completed',
    progress: 100,
    lastUpdated: 'Just now',
    summaryOutput: 'Overall Rigor Score: 8.8/10. Passed methodology checks. Flagged 2 minor hardware bottleneck risks on consumer GPU configurations.',
    metrics: { durationSec: 6.9, tokensUsed: 15600, itemsProcessed: 4 }
  }
];

export const mockAcademicAgents: AcademicAgent[] = [
  {
    id: 'planner',
    name: 'Planner Agent',
    role: 'Auto-schedules syllabus milestones, thesis writing sprints, and exam revisions',
    status: 'completed',
    lastSync: '12 mins ago',
    insights: [
      'Balanced your 3 graduate assignments against research experimentation weeks.',
      'Auto-blocked 15 hours for literature review synthesis this Thursday-Saturday.'
    ]
  },
  {
    id: 'reminder',
    name: 'Reminder Agent',
    role: 'Predictive deadline alerts, submission warnings, and spaced-repetition prompts',
    status: 'running',
    lastSync: 'Live',
    insights: [
      'NeurIPS 2026 Workshop Abstract registration closes in 6 days.',
      'CS330 Deep Multi-Task Learning assignment due in 48 hours.'
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    role: 'Computes velocity, task completion efficiency, study patterns, and burn-down charts',
    status: 'completed',
    lastSync: '1 hour ago',
    insights: [
      'Research velocity increased by +28% this week compared to monthly average.',
      'Task completion accuracy is currently at 91.4%.'
    ]
  },
  {
    id: 'progress_tracker',
    name: 'Progress Tracker Agent',
    role: 'Maintains milestone progression toward thesis defense and semester degree completion',
    status: 'completed',
    lastSync: '30 mins ago',
    insights: [
      'Thesis Stage 2 (Methodology Formulation) reached 100% completion.',
      'Overall Master’s Capstone progress stands at 68%.'
    ]
  }
];

export const mockPapers: ResearchPaper[] = [
  {
    id: 'p1',
    title: 'Self-Reflective Multi-Agent Architectures for Complex Scientific Synthesis',
    authors: ['K. Vaswani', 'M. Zhang', 'A. Chen', 'D. Silver'],
    year: 2025,
    venue: 'NeurIPS 2025 (Oral)',
    summary: 'Proposes a dual-agent consensus mechanism where reasoning loops are audited by an adversarial verifier agent, preventing hallucinations in scientific summarization.',
    methodology: 'Iterative critique-refine loop with entropy-based validation gates.',
    dataset: 'SciCite, PubMedQA, ArXivSynthesis-24',
    results: '93.2% factual fidelity (+14.1% over naive RAG); 38% reduction in invalid claims.',
    limitations: 'High token latency (4.8x standard inference); requires multiple high-capacity LLM instances.',
    citation: 'Vaswani, K., et al. (2025). Self-Reflective Multi-Agent Architectures. NeurIPS.',
    relevanceScore: 98,
    tags: ['Multi-Agent', 'Scientific RAG', 'Verification']
  },
  {
    id: 'p2',
    title: 'Adaptive Retrieval Graphs: Dynamic Knowledge Traversal for Academic Reasoning',
    authors: ['L. Zhao', 'R. Gomez', 'H. Patel'],
    year: 2024,
    venue: 'ICLR 2024',
    summary: 'Replaces static vector indexes with a dynamic knowledge graph that updates node relationships based on inter-paper citation context.',
    methodology: 'Graph Neural Network coupled with dynamic hybrid dense-sparse vector scoring.',
    dataset: 'OGB-MAG240M, HotpotQA multi-hop',
    results: '+18.4% retrieval recall on complex multi-hop academic queries.',
    limitations: 'Computationally heavy graph maintenance; fragile to noisy citation links.',
    citation: 'Zhao, L., et al. (2024). Adaptive Retrieval Graphs. ICLR.',
    relevanceScore: 94,
    tags: ['Knowledge Graph', 'RAG', 'Graph Neural Networks']
  },
  {
    id: 'p3',
    title: 'Speculative Verification in Autonomous Research Assistants',
    authors: ['J. Thorne', 'S. Narang', 'E. Rostova'],
    year: 2025,
    venue: 'ACL 2025',
    summary: 'Introduces draft-then-verify execution pipelines for automated hypothesis generation, bypassing heavy chain-of-thought overhead.',
    methodology: 'Speculative decoding paradigm applied to multi-agent task planning.',
    dataset: 'GSM8K, StrategyQA, BioMed-Reason',
    results: '2.4x speedup with zero degradation in empirical reasoning accuracy.',
    limitations: 'Sensitive to draft model calibration; failures in rare interdisciplinary domains.',
    citation: 'Thorne, J., et al. (2025). Speculative Verification in Autonomous Research Assistants. ACL.',
    relevanceScore: 91,
    tags: ['Speculative Execution', 'Speedup', 'Verification']
  },
  {
    id: 'p4',
    title: 'Human-in-the-Loop Guardrails for Autonomous Literature Discovery',
    authors: ['T. Morrison', 'F. Liu', 'B. Schölkopf'],
    year: 2024,
    venue: 'AAAI 2024',
    summary: 'A study on student researcher trust calibration when AI agents make autonomous decisions during thesis research.',
    methodology: 'Empirical user study (n=140 graduate researchers) with randomized approval gates.',
    dataset: 'AcademicWorkflow-Bench',
    results: 'Interactive checkpoints increased accepted research proposal validity by 44%.',
    limitations: 'User fatigue if checkpoints are set too frequently.',
    citation: 'Morrison, T., et al. (2024). Human-in-the-Loop Guardrails. AAAI.',
    relevanceScore: 89,
    tags: ['Human-in-the-Loop', 'UI/UX', 'Trust Calibration']
  }
];

export const mockComparisonMatrix: ComparisonMatrixRow[] = [
  {
    paperId: 'p1',
    paperTitle: 'Self-Reflective Multi-Agent Architectures (Vaswani et al., 2025)',
    year: 2025,
    methodology: 'Dual-agent consensus loop with adversarial verifier',
    dataset: 'SciCite, PubMedQA, ArXivSynthesis-24',
    results: '93.2% factual fidelity (+14.1% over baseline)',
    limitations: 'High token latency (4.8x standard inference)',
    strengths: 'Drastically cuts scientific hallucinations'
  },
  {
    paperId: 'p2',
    paperTitle: 'Adaptive Retrieval Graphs (Zhao et al., 2024)',
    year: 2024,
    methodology: 'Dynamic GNN + Dense/Sparse vector index',
    dataset: 'OGB-MAG240M, HotpotQA',
    results: '+18.4% retrieval recall on multi-hop questions',
    limitations: 'Expensive graph indexing overhead',
    strengths: 'Excellent contextual traversal across citations'
  },
  {
    paperId: 'p3',
    paperTitle: 'Speculative Verification in Research Assistants (Thorne et al., 2025)',
    year: 2025,
    methodology: 'Draft-verify speculative task execution',
    dataset: 'StrategyQA, BioMed-Reason',
    results: '2.4x execution speedup without loss of accuracy',
    limitations: 'Draft model miscalibration in niche domains',
    strengths: 'Low runtime cost for continuous agent workflows'
  }
];

export const mockResearchGaps: ResearchGap[] = [
  {
    id: 'gap-01',
    title: 'Verification Latency Bottleneck in Scientific Agent Pipelines',
    description: 'Existing self-reflective multi-agent systems trigger redundant verification calls, leading to 4.8x latency spikes that hinder interactive student adoption.',
    impactScore: 9.4,
    feasibilityScore: 8.6,
    sourcePaperIds: ['p1', 'p3'],
    sourcePaperTitles: ['Self-Reflective Multi-Agent Architectures', 'Speculative Verification in Autonomous Research']
  },
  {
    id: 'gap-02',
    title: 'Uncalibrated Student Feedback Integration in Academic AI Schedulers',
    description: 'Current academic assistants operate on rigid time-blocking without adapting to real-time research cognitive load or thesis milestone blockers.',
    impactScore: 8.7,
    feasibilityScore: 9.0,
    sourcePaperIds: ['p4'],
    sourcePaperTitles: ['Human-in-the-Loop Guardrails for Autonomous Literature Discovery']
  },
  {
    id: 'gap-03',
    title: 'Static Knowledge Indexes Failing Interdisciplinary Cross-Pollination',
    description: 'Dense vector search alone cannot connect distant analogical breakthroughs between disparate academic domains (e.g., neuroscience concepts applied to distributed AI).',
    impactScore: 9.1,
    feasibilityScore: 7.8,
    sourcePaperIds: ['p2'],
    sourcePaperTitles: ['Adaptive Retrieval Graphs']
  }
];

export const mockSuggestedIdeas: SuggestedIdea[] = [
  {
    id: 'idea-01',
    title: 'Speculative Consensus Networks with Student-Calibrated Confidence Gates',
    coreHypothesis: 'Applying speculative decoding principles to multi-agent consensus allows 70% of low-ambiguity research subtasks to resolve in <1.2s, escalating to full adversarial debate only when entropy exceeds student-defined tolerances.',
    rationale: 'Directly solves Gap-01 by marrying Vaswani et al.\'s factual fidelity with Thorne et al.\'s speculative speedup.',
    targetGapId: 'gap-01',
    recommendedArchitecture: 'Hierarchical 3-tier agent pipeline: Fast Draft Agent -> Entropy Validator -> Deep Adversarial Panel',
    estimatedEffortWeeks: 6
  },
  {
    id: 'idea-02',
    title: 'Cognitive-Load Aware Academic Milestone Orchestrator',
    coreHypothesis: 'Dynamic task scheduling coupled with real-time research paper reading velocity predicts student burnout and automatically redistributes milestone deadlines.',
    rationale: 'Addresses Gap-02 by turning static academic reminders into an adaptive progress governor.',
    targetGapId: 'gap-02',
    recommendedArchitecture: 'Stateful RL-based Scheduler Agent with User In-The-Loop Approval Gates',
    estimatedEffortWeeks: 4
  }
];

export const mockMethodologySteps: MethodologyStep[] = [
  {
    stepNumber: 1,
    title: 'Speculative Candidate Drafting',
    description: 'A 7B parameter draft agent generates rapid candidate hypotheses and extracts primary paper claims in parallel.',
    inputs: ['User Research Question', 'Top-15 Retained ArXiv Abstracts'],
    outputs: ['3 Candidate Hypotheses', 'Structured Semantic Schema'],
    recommendedTools: ['vLLM', 'Mistral-7B-Instruct', 'LangChain Expression Language']
  },
  {
    stepNumber: 2,
    title: 'Entropy-Gated Verification Routing',
    description: 'Calculates claim uncertainty score U = -sum(p log p). If U < 0.22, candidate passes automatically; otherwise routed to full panel.',
    inputs: ['Candidate Hypotheses', 'Uncertainty Threshold theta'],
    outputs: ['Routing Decision (FastPath vs DeepVerify)'],
    recommendedTools: ['HuggingFace Tokenizer', 'SciBERT Entropy Estimator']
  },
  {
    stepNumber: 3,
    title: 'Cross-Paper Matrix Synthesis',
    description: 'Paper Intelligence Agent extracts structured metrics into a relational comparison schema.',
    inputs: ['Filtered Full-Text PDFs'],
    outputs: ['JSON Comparison Matrix', 'Identified Gaps'],
    recommendedTools: ['PyMuPDF', 'Grobid Parser', 'ChromaDB / FAISS']
  },
  {
    stepNumber: 4,
    title: 'Adversarial Reviewer Simulation',
    description: 'Simulates 3 distinct peer reviewers (Methodological Rigor, Experimental Soundness, Citation Provenance).',
    inputs: ['Synthesized Research Proposal'],
    outputs: ['Reviewer Scorecard', 'Actionable Revision Recommendations'],
    recommendedTools: ['Claude 3.5 Sonnet / GPT-4o Persona Prompts']
  },
  {
    stepNumber: 5,
    title: 'Human Student Approval Gate',
    description: 'Presents interactive proposal for student review, allowing notes, modifications, and formal approval before final execution.',
    inputs: ['Full Proposal', 'Reviewer Scorecard'],
    outputs: ['Signed Final Research Plan', 'Exportable PDF/LaTeX'],
    recommendedTools: ['ResearchFlow UI Approval Modal', 'FastAPI Webhook']
  }
];

export const mockCitations: CitationItem[] = [
  {
    id: 'cit-01',
    paperTitle: 'Self-Reflective Multi-Agent Architectures for Complex Scientific Synthesis',
    authors: 'Vaswani, K., Zhang, M., Chen, A., & Silver, D.',
    year: 2025,
    format: 'APA',
    rawCitation: 'Vaswani, K., Zhang, M., Chen, A., & Silver, D. (2025). Self-Reflective Multi-Agent Architectures for Complex Scientific Synthesis. Advances in Neural Information Processing Systems (NeurIPS), 38, 1142–1158.'
  },
  {
    id: 'cit-02',
    paperTitle: 'Adaptive Retrieval Graphs: Dynamic Knowledge Traversal for Academic Reasoning',
    authors: 'L. Zhao, R. Gomez, and H. Patel',
    year: 2024,
    format: 'IEEE',
    rawCitation: 'L. Zhao, R. Gomez, and H. Patel, "Adaptive Retrieval Graphs: Dynamic Knowledge Traversal for Academic Reasoning," in Proc. Int. Conf. Learn. Represent. (ICLR), Vienna, Austria, 2024, pp. 1–16.'
  },
  {
    id: 'cit-03',
    paperTitle: 'Speculative Verification in Autonomous Research Assistants',
    authors: 'Thorne, James and Narang, Sharan and Rostova, Elena',
    year: 2025,
    format: 'BibTeX',
    rawCitation: `@inproceedings{thorne2025speculative,
  title={Speculative Verification in Autonomous Research Assistants},
  author={Thorne, James and Narang, Sharan and Rostova, Elena},
  booktitle={Proceedings of the 63rd Annual Meeting of the Association for Computational Linguistics (ACL)},
  pages={412--427},
  year={2025}
}`
  }
];

export const mockReviewerFeedback: ReviewerFeedbackItem[] = [
  {
    category: 'Quality',
    severity: 'low',
    title: 'Methodology Formalization is Thorough',
    detail: 'The mathematical formulation for entropy-gated verification (Eq. 2) is well-bounded and logically sound.',
    actionableSuggestion: 'State explicit epsilon calibration values used across HotpotQA benchmarks.'
  },
  {
    category: 'Missing Information',
    severity: 'medium',
    title: 'Ablation Study Specification Needed',
    detail: 'The current plan tests end-to-end latency but does not isolate the contribution of the draft agent vs. the verifier agent.',
    actionableSuggestion: 'Add an ablation table comparing Draft-Only, Verifier-Only, and Speculative-Combined configurations.'
  },
  {
    category: 'Consistency',
    severity: 'low',
    title: 'Dataset Notation Consistent',
    detail: 'All benchmark references match standardized nomenclature in OGB and HuggingFace repositories.',
    actionableSuggestion: 'None needed; maintain existing schema.'
  },
  {
    category: 'Feasibility',
    severity: 'high',
    title: 'GPU Memory Budget for Multi-Agent Panel',
    detail: 'Running 3 concurrent 70B parameter models for the adversarial panel will exceed single-node 80GB VRAM allocations.',
    actionableSuggestion: 'Incorporate 4-bit AWQ quantization or offload reviewer agents sequentially rather than concurrently.'
  }
];

export const mockAcademicTasks: AcademicTask[] = [
  {
    id: 't-1',
    title: 'Complete Research Methodology Writeup for Thesis Capstone',
    type: 'research_milestone',
    courseOrProject: 'Master Thesis',
    dueDate: '2026-09-12',
    completed: true,
    priority: 'high',
    assignedAgent: 'planner'
  },
  {
    id: 't-2',
    title: 'Review 5 Papers on Speculative Decoding in LLMs',
    type: 'paper_reading',
    courseOrProject: 'CS 330 Advanced AI',
    dueDate: '2026-09-14',
    completed: false,
    priority: 'medium',
    assignedAgent: 'reminder'
  },
  {
    id: 't-3',
    title: 'Submit NeurIPS 2026 Student Workshop Extended Abstract',
    type: 'assignment',
    courseOrProject: 'Research Lab',
    dueDate: '2026-09-18',
    completed: false,
    priority: 'high',
    assignedAgent: 'planner'
  },
  {
    id: 't-4',
    title: 'Prepare Slide Deck for Advisor Bi-Weekly Review',
    type: 'assignment',
    courseOrProject: 'Prof. Rostova Lab Meeting',
    dueDate: '2026-09-15',
    completed: false,
    priority: 'medium',
    assignedAgent: 'progress_tracker'
  },
  {
    id: 't-5',
    title: 'Midterm Exam: Advanced Machine Learning Theory',
    type: 'exam',
    courseOrProject: 'CS 229M',
    dueDate: '2026-09-28',
    completed: false,
    priority: 'high',
    assignedAgent: 'reminder'
  }
];

export const mockAcademicDeadlines: AcademicDeadline[] = [
  {
    id: 'dl-1',
    title: 'CS 330 Assignment 3 (Distributed Training)',
    dueDate: 'Sep 10, 2026 - 11:59 PM',
    course: 'CS 330',
    daysRemaining: 2,
    urgent: true,
    type: 'submission'
  },
  {
    id: 'dl-2',
    title: 'Thesis Milestone: Methodology Approval',
    dueDate: 'Sep 14, 2026',
    course: 'Thesis Capstone',
    daysRemaining: 6,
    urgent: true,
    type: 'milestone'
  },
  {
    id: 'dl-3',
    title: 'NeurIPS Workshop Abstract Due',
    dueDate: 'Sep 18, 2026',
    course: 'Publications',
    daysRemaining: 10,
    urgent: false,
    type: 'submission'
  },
  {
    id: 'dl-4',
    title: 'CS 229M Midterm Examination',
    dueDate: 'Sep 28, 2026',
    course: 'CS 229M',
    daysRemaining: 20,
    urgent: false,
    type: 'exam'
  }
];

export const mockFinalPlan: FinalResearchPlan = {
  projectId: 'rf-2026-09-001',
  topic: 'Speculative Multi-Agent Consensus for High-Speed Scientific Synthesis',
  generatedDate: 'September 7, 2026',
  problemStatement: 'Current automated scientific literature agents suffer from unacceptable latency bottlenecks and uncalibrated human trust, limiting real-time adoption in academic thesis workflows.',
  novelHypothesis: 'A hierarchical speculative drafting protocol coupled with entropy-gated human validation checkpoints can reduce multi-agent latency by 41% while maintaining >92% empirical claim verification.',
  methodologySummary: '5-stage pipeline consisting of Mistral-7B speculative drafting, SciBERT token entropy routing, dynamic citation graph traversal, AWQ-quantized reviewer panel critique, and student checkpoint authorization.',
  datasets: ['PubMedQA Scientific Benchmark', 'ArXivSynthesis-24', 'SciCite Relational Dataset'],
  deliverables: [
    'Modular FastAPI backend with WebSocket agent streaming',
    'Interactive React + Tailwind dashboard with approval gate',
    'Full reproducible benchmark notebook with 1000 simulated queries'
  ],
  risksAndMitigations: [
    {
      risk: 'Draft model miscalibration on bleeding-edge interdisciplinary papers',
      mitigation: 'Fallback mechanism that routes high-entropy claims (>0.25) directly to Claude 3.5 Sonnet.'
    },
    {
      risk: 'Student checkpoint fatigue from frequent approvals',
      mitigation: 'Configurable sensitivity slider allowing students to approve batches or set autonomous confidence thresholds.'
    }
  ],
  humanApprovalStatus: 'pending_review'
};
