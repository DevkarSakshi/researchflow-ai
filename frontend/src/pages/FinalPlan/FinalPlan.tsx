import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  Cpu,
  GitCompare,
  Sparkles,
  Compass,
  Quote,
  ShieldCheck,
  Download,
  Calendar,
  FileText,
  Target,
  Lightbulb,
  BarChart3,
} from 'lucide-react';

import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

/* =========================================================
   LOCAL DATA TYPES
   These match the current backend responses.
========================================================= */

interface PlanData {
  projectId: string;
  topic: string;
  generatedDate: string;
  humanApprovalStatus:
    | 'approved'
    | 'pending_review'
    | 'changes_requested'
    | 'rejected';
  studentNotes?: string;
  approvedAt?: string;
}

interface PaperData {
  id?: string;
  title: string;
  authors?: string[];
  year?: number;
  venue?: string;
  abstract?: string;
  summary?: string;
  methodology?: string;
  dataset?: string;
  models_or_techniques?: string;
  results?: string;
  key_findings?: string;
  limitations?: string;
  doi?: string;
  url?: string;
  pdf_url?: string;
  source?: string;
  analysis_source?: string;
}

interface ComparisonData {
  paperId?: string;
  paperTitle: string;
  authors?: string[];
  year?: number;
  methodology?: string;
  dataset?: string;
  models_or_techniques?: string;
  results?: string;
  key_findings?: string;
  limitations?: string;
  strengths?: string;
}

interface GapData {
  id?: string;
  title: string;
  description: string;
  impactScore?: number;
  feasibilityScore?: number;
  sourcePaperTitles?: string[];
}

interface IdeaData {
  id?: string;
  title: string;
  core_hypothesis: string;
  rationale: string;
  architecture: string;
  effort_weeks?: number;
  target?: string;
  source_gap?: string;
}

interface MethodologyData {
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
}

interface CitationData {
  title: string;
  authors: string[];
  year?: number;
  venue?: string;
  doi?: string;
  url?: string;
  pdf_url?: string;
  source?: string;
  citation_text: string;
}

interface ReviewerData {
  reviewer_feedback?: string;
}

/* =========================================================
   METHODOLOGY SECTION DEFINITIONS
========================================================= */

const methodologySections: {
  key: keyof MethodologyData;
  title: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'problem_definition',
    title: 'Problem Definition',
    icon: <Target className="w-4 h-4" />,
  },
  {
    key: 'research_objective',
    title: 'Research Objective',
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    key: 'data_collection',
    title: 'Data Collection',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    key: 'preprocessing',
    title: 'Preprocessing',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    key: 'baseline_models',
    title: 'Baseline Models',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    key: 'proposed_approach',
    title: 'Proposed Approach',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    key: 'training_strategy',
    title: 'Training Strategy',
    icon: <Cpu className="w-4 h-4" />,
  },
  {
    key: 'evaluation',
    title: 'Evaluation',
    icon: <BarChart3 className="w-4 h-4" />,
  },
  {
    key: 'explainability',
    title: 'Explainability',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    key: 'expected_outcome',
    title: 'Expected Outcome',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

export const FinalPlan: React.FC = () => {
   console.log('FINAL PLAN COMPONENT LOADED');
  const [plan, setPlan] = useState<PlanData | null>(null);

  const [papers, setPapers] = useState<PaperData[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [gaps, setGaps] = useState<GapData[]>([]);
  const [ideas, setIdeas] = useState<IdeaData[]>([]);
  const [methodology, setMethodology] =
    useState<MethodologyData | null>(null);
  const [citations, setCitations] =
    useState<CitationData[]>([]);
  const [reviewerFeedback, setReviewerFeedback] =
    useState<ReviewerData | null>(null);

  const [studentNotes, setStudentNotes] = useState('');
  const [statusMessage, setStatusMessage] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     LOAD ALL RESEARCH DATA
  ======================================================= */

  useEffect(() => {
  async function loadAllData() {
    setLoading(true);
    setError(null);

    try {
      // Load the final plan first.
      // This should not fail just because another research endpoint fails.
      const planData = await agentService.getFinalPlan();

      setPlan(planData as unknown as PlanData);

      // Load supporting research data independently.
      const [
        paperResult,
        comparisonResult,
        gapResult,
        methodologyResult,
        citationResult,
        reviewerResult,
      ] = await Promise.allSettled([
        agentService.getPapers(),
        agentService.getComparisonMatrix(),
        agentService.getGapsAndIdeas(),
        agentService.getMethodology(),
        agentService.getCitations(),
        agentService.getReviewerFeedback(),
      ]);

      if (paperResult.status === 'fulfilled') {
        setPapers(
          (paperResult.value || []) as unknown as PaperData[]
        );
      }

      if (comparisonResult.status === 'fulfilled') {
        setComparisons(
          (comparisonResult.value || []) as unknown as ComparisonData[]
        );
      }

      if (gapResult.status === 'fulfilled') {
        const result =
          gapResult.value as unknown as {
            research_gaps?: GapData[];
            research_ideas?: IdeaData[];
          };

        setGaps(result?.research_gaps || []);
        setIdeas(result?.research_ideas || []);
      }

      if (methodologyResult.status === 'fulfilled') {
        setMethodology(
          methodologyResult.value as unknown as MethodologyData
        );
      }

      if (citationResult.status === 'fulfilled') {
        setCitations(
          (citationResult.value || []) as unknown as CitationData[]
        );
      }

      if (reviewerResult.status === 'fulfilled') {
        setReviewerFeedback(
          reviewerResult.value as unknown as ReviewerData
        );
      }

      // Log individual endpoint failures without hiding the final plan.
      if (paperResult.status === 'rejected') {
        console.error('Failed to load papers:', paperResult.reason);
      }

      if (comparisonResult.status === 'rejected') {
        console.error(
          'Failed to load comparison:',
          comparisonResult.reason
        );
      }

      if (gapResult.status === 'rejected') {
        console.error(
          'Failed to load gaps and ideas:',
          gapResult.reason
        );
      }

      if (methodologyResult.status === 'rejected') {
        console.error(
          'Failed to load methodology:',
          methodologyResult.reason
        );
      }

      if (citationResult.status === 'rejected') {
        console.error(
          'Failed to load citations:',
          citationResult.reason
        );
      }

      if (reviewerResult.status === 'rejected') {
        console.error(
          'Failed to load reviewer feedback:',
          reviewerResult.reason
        );
      }

    } catch (err) {
      console.error(
        'Failed to load final research plan:',
        err
      );

      setError(
        'Unable to load the final research plan.'
      );
    } finally {
      setLoading(false);
    }
  }

  loadAllData();
}, []);
  /* =======================================================
     STUDENT APPROVAL
  ======================================================= */

  async function handleDecision(
    decision:
      | 'approved'
      | 'rejected'
      | 'changes_requested'
  ) {
    console.log('APPROVAL BUTTON CLICKED:', decision);
    try {
      const response =
        await agentService.submitPlanApproval(
          decision,
          studentNotes
        );

        console.log('APPROVAL RESPONSE:', response);
      const workflow =
  response.updatedPlan as unknown as {
    final_research_plan?: PlanData;
    [key: string]: unknown;
  };

const updatedPlan: PlanData =
  workflow.final_research_plan
    ? {
        ...workflow.final_research_plan,
        humanApprovalStatus: decision,
        studentNotes
      }
    : {
        projectId:
          String(workflow.researchflow_id || ''),
        topic:
          String(workflow.research_problem || ''),
        generatedDate:
          workflow.created_at
            ? new Date(
                String(workflow.created_at)
              ).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            : new Date().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }),
        humanApprovalStatus: decision,
        studentNotes,
        approvedAt:
          decision === 'approved'
            ? new Date().toISOString()
            : undefined
      };

console.log('FINAL UI PLAN:', updatedPlan);

setPlan(updatedPlan);

      if (decision === 'approved') {
        setStatusMessage(
          'Research Plan approved successfully. The plan is now marked as approved by the student.'
        );
      } else if (decision === 'changes_requested') {
        setStatusMessage(
          'Revision request recorded. Your notes have been attached to the research plan.'
        );
      } else {
        setStatusMessage(
          'Research Plan has been rejected.'
        );
      }

      window.setTimeout(() => {
        setStatusMessage(null);
      }, 6000);
    } catch (err) {
      console.error(
        'Failed to submit approval decision:',
        err
      );

      setStatusMessage(
        'Unable to save the approval decision. Please check the backend approval endpoint.'
      );
    }
  }

  /* =======================================================
     EXPORT MARKDOWN
  ======================================================= */

  function exportPlan() {
    if (!plan) return;

    const lines: string[] = [
      '# Final Synthesized Research Plan',
      '',
      `**Plan ID:** ${plan.projectId}`,
      `**Topic:** ${plan.topic}`,
      `**Generated:** ${plan.generatedDate}`,
      `**Approval Status:** ${plan.humanApprovalStatus}`,
      '',
      '---',
      '',
      '## 1. Literature Synthesis',
      '',
      ...papers.map(
        (paper, index) =>
          `### ${index + 1}. ${paper.title}
- **Authors:** ${
            paper.authors?.join(', ') || 'Not available'
          }
- **Year:** ${paper.year || 'Not available'}
- **Venue:** ${paper.venue || 'Not available'}
- **Abstract:** ${
            paper.abstract ||
            paper.summary ||
            'Not available'
          }
- **DOI:** ${paper.doi || 'Not available'}
`
      ),
      '---',
      '',
      '## 2. Paper Intelligence',
      '',
      ...papers.map(
        (paper, index) =>
          `### Paper ${index + 1}: ${paper.title}
- **Methodology:** ${
            paper.methodology || 'Not available'
          }
- **Dataset:** ${
            paper.dataset || 'Not available'
          }
- **Models / Techniques:** ${
            paper.models_or_techniques ||
            'Not available'
          }
- **Results:** ${
            paper.results || 'Not available'
          }
- **Key Findings:** ${
            paper.key_findings || 'Not available'
          }
- **Limitations:** ${
            paper.limitations || 'Not available'
          }
`
      ),
      '---',
      '',
      '## 3. Cross-Paper Comparison',
      '',
      ...comparisons.map(
        (comparison, index) =>
          `### Comparison ${index + 1}: ${
            comparison.paperTitle
          }
- **Year:** ${
            comparison.year || 'Not available'
          }
- **Methodology:** ${
            comparison.methodology ||
            'Not available'
          }
- **Dataset:** ${
            comparison.dataset || 'Not available'
          }
- **Models / Techniques:** ${
            comparison.models_or_techniques ||
            'Not available'
          }
- **Results:** ${
            comparison.results ||
            'Not available'
          }
- **Key Findings:** ${
            comparison.key_findings ||
            'Not available'
          }
- **Limitations:** ${
            comparison.limitations ||
            'Not available'
          }
`
      ),
      '---',
      '',
      '## 4. Research Gaps',
      '',
      ...gaps.map(
        (gap, index) =>
          `### Gap ${index + 1}: ${gap.title}
${gap.description}

- **Impact Score:** ${
            gap.impactScore ?? 'Not available'
          }/10
- **Feasibility Score:** ${
            gap.feasibilityScore ?? 'Not available'
          }/10
- **Source Papers:** ${
            gap.sourcePaperTitles?.join('; ') ||
            'Not available'
          }
`
      ),
      '---',
      '',
      '## 5. Suggested Research Ideas',
      '',
      ...(ideas.length
        ? ideas.map(
            (idea, index) =>
              `### Idea ${index + 1}: ${idea.title}
- **Core Hypothesis:** ${
                idea.core_hypothesis
              }
- **Rationale:** ${idea.rationale}
- **Architecture:** ${
                idea.architecture
              }
- **Estimated Effort:** ${
                idea.effort_weeks ?? 'Not available'
              } weeks
- **Target:** ${
                idea.target || 'Not available'
              }
- **Source Gap:** ${
                idea.source_gap ||
                'Not available'
              }
`
          )
        : [
            'No research ideas were generated by the Idea Agent.',
            '',
          ]),
      '---',
      '',
      '## 6. Recommended Methodology',
      '',
      ...(methodology
        ? methodologySections.map(
            (section, index) =>
              `### ${index + 1}. ${
                section.title
              }
${methodology[section.key]}
`
          )
        : ['Methodology not available.']),
      '---',
      '',
      '## 7. Verified Citations',
      '',
      ...citations.map(
        (citation, index) =>
          `${index + 1}. ${
            citation.citation_text
          }`
      ),
      '',
      '---',
      '',
      '## 8. Reviewer Validation',
      '',
      reviewerFeedback?.reviewer_feedback ||
        'Reviewer feedback not available.',
      '',
      '---',
      '',
      '## Student Notes',
      '',
      studentNotes || 'No notes provided.',
      '',
      '---',
      '',
      '*Generated by ResearchFlow AI — Multi-Agent Academic Research Platform*',
    ];

    const content = lines.join('\n');

    const blob = new Blob([content], {
      type: 'text/markdown;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `ResearchFlow_Final_Plan_${plan.projectId}_${new Date()
      .toISOString()
      .slice(0, 10)}.md`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-10">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">
              Loading synthesized research plan...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error || !plan) {
    return (
      <div className="space-y-6">
        <Card className="border-rose-500/30 bg-rose-950/10">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />

            <div>
              <h3 className="font-semibold text-white">
                Final Research Plan Unavailable
              </h3>

              <p className="text-sm text-slate-400 mt-2">
                {error ||
                  'No final research plan is available yet.'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* =======================================================
     APPROVAL BADGE
  ======================================================= */

  const approvalBadge =
    plan.humanApprovalStatus === 'approved' ? (
      <Badge variant="emerald" size="md">
        Approved by Student
      </Badge>
    ) : plan.humanApprovalStatus ===
      'changes_requested' ? (
      <Badge variant="blue" size="md">
        Changes Requested
      </Badge>
    ) : plan.humanApprovalStatus === 'rejected' ? (
      <Badge variant="rose" size="md">
        Plan Rejected
      </Badge>
    ) : (
      <Badge
        variant="amber"
        size="md"
        pulse
      >
        Pending Student Review
      </Badge>
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">

      {/* ===================================================
          HERO
      =================================================== */}

      <div className="relative overflow-hidden rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/60 p-6 md:p-8">

        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative">

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            <div className="space-y-4">

              <div className="flex flex-wrap items-center gap-2">

                <span className="text-[11px] font-mono text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  FINAL RESEARCH PLAN
                </span>

                <span className="text-[11px] font-mono text-slate-400 bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                  {plan.projectId}
                </span>

              </div>

              <div>

                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Final Synthesized Research Plan
                </h1>

                <p className="text-sm text-slate-300 mt-3 max-w-3xl leading-relaxed">
                  The complete research direction synthesized
                  from literature evidence, paper intelligence,
                  cross-paper comparison, research gaps,
                  methodology and reviewer validation.
                </p>

              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400">

                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Generated: {plan.generatedDate}
                </span>

                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  {papers.length} papers
                </span>

                <span className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-emerald-400" />
                  {citations.length} citations
                </span>

              </div>

            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">

              {approvalBadge}

              <Button
                variant="secondary"
                size="sm"
                onClick={exportPlan}
                icon={
                  <Download className="w-4 h-4" />
                }
              >
                Export Research Plan
              </Button>

            </div>

          </div>

          {/* Topic */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-950/50 border border-slate-800">

            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
              Research Problem
            </div>

            <div className="text-base md:text-lg font-semibold text-white mt-1">
              {plan.topic}
            </div>

          </div>

        </div>
      </div>

      {/* ===================================================
          STATUS MESSAGE
      =================================================== */}

      {statusMessage && (
        <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">

          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />

          <p className="text-sm text-emerald-200">
            {statusMessage}
          </p>

        </div>
      )}

      {/* ===================================================
          QUICK SUMMARY
      =================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <BookOpen className="w-5 h-5 text-blue-400 mb-3" />
          <div className="text-2xl font-bold text-white">
            {papers.length}
          </div>
          <div className="text-xs text-slate-400">
            Research Papers
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
          <AlertCircle className="w-5 h-5 text-rose-400 mb-3" />
          <div className="text-2xl font-bold text-white">
            {gaps.length}
          </div>
          <div className="text-xs text-slate-400">
            Research Gaps
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <Sparkles className="w-5 h-5 text-amber-400 mb-3" />
          <div className="text-2xl font-bold text-white">
            {ideas.length}
          </div>
          <div className="text-xs text-slate-400">
            Research Ideas
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
          <Quote className="w-5 h-5 text-emerald-400 mb-3" />
          <div className="text-2xl font-bold text-white">
            {citations.length}
          </div>
          <div className="text-xs text-slate-400">
            Citations
          </div>
        </div>

      </div>

      {/* ===================================================
          SECTION 1 — LITERATURE
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="01"
          icon={
            <BookOpen className="w-5 h-5 text-blue-400" />
          }
          title="Literature Synthesis"
          badge={`${papers.length} Papers`}
        />

        <p className="text-sm text-slate-400 leading-relaxed">
          Research papers retrieved by the Literature Agent
          and used as the evidence base for the research
          workflow.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {papers.map((paper, index) => (

            <div
              key={
                paper.id ||
                `${paper.title}-${index}`
              }
              className="group p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/30 transition-all"
            >

              <div className="flex items-start justify-between gap-3">

                <div className="flex gap-3">

                  <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div>
                    <h4 className="text-sm font-semibold text-white leading-relaxed">
                      {paper.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1">
                      {paper.year || 'Year unavailable'}
                      {paper.venue
                        ? ` • ${paper.venue}`
                        : ''}
                    </p>
                  </div>

                </div>

              </div>

              {paper.authors &&
                paper.authors.length > 0 && (
                  <p className="text-xs text-slate-400 mt-4">
                    {paper.authors.join(', ')}
                  </p>
                )}

              <p className="text-xs text-slate-300 leading-relaxed mt-3 line-clamp-4">
                {paper.abstract ||
                  paper.summary ||
                  'Abstract information is not available from the retrieved record.'}
              </p>

            </div>

          ))}

        </div>

      </Card>

      {/* ===================================================
          SECTION 2 — PAPER INTELLIGENCE
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="02"
          icon={
            <Cpu className="w-5 h-5 text-purple-400" />
          }
          title="Paper Intelligence"
          badge="Deep Extraction"
        />

        <div className="space-y-4">

          {papers.map((paper, index) => (

            <div
              key={
                `intelligence-${paper.id || index}`
              }
              className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800"
            >

              <h4 className="font-semibold text-white text-sm mb-4">
                {paper.title}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                <InfoBox
                  label="Methodology"
                  value={
                    paper.methodology ||
                    'Not available'
                  }
                />

                <InfoBox
                  label="Dataset"
                  value={
                    paper.dataset ||
                    'Not available'
                  }
                  highlight
                />

                <InfoBox
                  label="Models / Techniques"
                  value={
                    paper.models_or_techniques ||
                    'Not available'
                  }
                />

                <InfoBox
                  label="Reported Results"
                  value={
                    paper.results ||
                    'Not available'
                  }
                />

              </div>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">

                <InfoBox
                  label="Key Findings"
                  value={
                    paper.key_findings ||
                    'Not available'
                  }
                />

                <InfoBox
                  label="Limitations"
                  value={
                    paper.limitations ||
                    'Not available'
                  }
                />

              </div>

            </div>

          ))}

        </div>

      </Card>

      {/* ===================================================
          SECTION 3 — COMPARISON
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="03"
          icon={
            <GitCompare className="w-5 h-5 text-emerald-400" />
          }
          title="Cross-Paper Comparison"
          badge={`${comparisons.length} Compared`}
        />

        <div className="overflow-x-auto rounded-2xl border border-slate-800">

          <table className="w-full text-left text-xs">

            <thead className="bg-slate-900">

              <tr className="border-b border-slate-800">

                <th className="p-4 text-slate-400 font-semibold">
                  Paper
                </th>

                <th className="p-4 text-slate-400 font-semibold">
                  Methodology
                </th>

                <th className="p-4 text-slate-400 font-semibold">
                  Dataset
                </th>

                <th className="p-4 text-slate-400 font-semibold">
                  Results
                </th>

                <th className="p-4 text-slate-400 font-semibold">
                  Limitations
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-800">

              {comparisons.map(
                (comparison, index) => (

                  <tr
                    key={
                      comparison.paperId ||
                      `${comparison.paperTitle}-${index}`
                    }
                    className="hover:bg-slate-900/60 transition-colors"
                  >

                    <td className="p-4 min-w-[220px]">

                      <div className="font-semibold text-white">
                        {comparison.paperTitle}
                      </div>

                      <div className="text-[10px] text-slate-500 mt-1">
                        {comparison.year || ''}
                      </div>

                    </td>

                    <td className="p-4 text-slate-300 min-w-[220px]">
                      {comparison.methodology ||
                        'Not available'}
                    </td>

                    <td className="p-4 text-emerald-300 min-w-[180px]">
                      {comparison.dataset ||
                        'Not available'}
                    </td>

                    <td className="p-4 text-blue-300 min-w-[220px]">
                      {comparison.results ||
                        'Not available'}
                    </td>

                    <td className="p-4 text-rose-300/80 min-w-[220px]">
                      {comparison.limitations ||
                        'Not available'}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </Card>

      {/* ===================================================
          SECTION 4 — GAPS
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="04"
          icon={
            <AlertCircle className="w-5 h-5 text-rose-400" />
          }
          title="Identified Research Gaps"
          badge={`${gaps.length} Gap${gaps.length !== 1 ? 's' : ''}`}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {gaps.map((gap, index) => (

            <div
              key={
                gap.id ||
                `${gap.title}-${index}`
              }
              className="p-5 rounded-2xl bg-slate-950/60 border border-rose-500/20"
            >

              <div className="flex items-center justify-between gap-3">

                <Badge variant="rose">
                  GAP-{index + 1}
                </Badge>

                <div className="flex gap-2 text-[10px] font-mono">

                  <span className="text-rose-300">
                    Impact:{' '}
                    {gap.impactScore ?? '—'}/10
                  </span>

                  <span className="text-slate-500">
                    Feasibility:{' '}
                    {gap.feasibilityScore ?? '—'}/10
                  </span>

                </div>

              </div>

              <h4 className="text-sm font-bold text-white mt-4">
                {gap.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {gap.description}
              </p>

              {gap.sourcePaperTitles &&
                gap.sourcePaperTitles.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800">

                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                      Evidence Sources
                    </div>

                    <div className="flex flex-wrap gap-2">

                      {gap.sourcePaperTitles.map(
                        (title, sourceIndex) => (

                          <span
                            key={`${title}-${sourceIndex}`}
                            className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded-lg"
                          >
                            {title}
                          </span>

                        )
                      )}

                    </div>

                  </div>
                )}

            </div>

          ))}

        </div>

      </Card>

      {/* ===================================================
          SECTION 5 — IDEAS
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="05"
          icon={
            <Sparkles className="w-5 h-5 text-amber-400" />
          }
          title="Suggested Research Ideas"
          badge={`${ideas.length} Candidate Ideas`}
        />

        {ideas.length === 0 ? (

          <div className="p-6 rounded-2xl border border-amber-500/20 bg-amber-500/5">

            <div className="flex items-start gap-3">

              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />

              <div>

                <h4 className="text-sm font-semibold text-white">
                  No Research Ideas Generated
                </h4>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  The Idea Agent did not generate a candidate
                  research direction because the current gap
                  evidence was insufficient to establish a
                  defensible scientific research gap.
                </p>

              </div>

            </div>

          </div>

        ) : (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {ideas.map((idea, index) => (

              <div
                key={
                  idea.id ||
                  `${idea.title}-${index}`
                }
                className="p-5 rounded-2xl bg-slate-950/60 border border-amber-500/20"
              >

                <div className="flex items-center justify-between">

                  <Badge variant="amber">
                    IDEA-{index + 1}
                  </Badge>

                  {idea.effort_weeks && (
                    <span className="text-[10px] font-mono text-slate-400">
                      ~{idea.effort_weeks} weeks
                    </span>
                  )}

                </div>

                <h4 className="text-sm font-bold text-white mt-4">
                  {idea.title}
                </h4>

                <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">

                  <div className="text-[10px] uppercase tracking-wider text-blue-400">
                    Core Hypothesis
                  </div>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {idea.core_hypothesis}
                  </p>

                </div>

                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  <strong className="text-slate-300">
                    Rationale:
                  </strong>{' '}
                  {idea.rationale}
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  <strong className="text-slate-300">
                    Architecture:
                  </strong>{' '}
                  {idea.architecture}
                </p>

              </div>

            ))}

          </div>

        )}

      </Card>

      {/* ===================================================
          SECTION 6 — METHODOLOGY
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="06"
          icon={
            <Compass className="w-5 h-5 text-blue-400" />
          }
          title="Recommended Methodology"
          badge="10 Components"
        />

        {methodology && (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {methodologySections.map(
              (section, index) => (

                <div
                  key={section.key}
                  className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/20 transition-colors"
                >

                  <div className="flex items-center gap-3">

                    <span className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}
                    </span>

                    <div className="flex items-center gap-2 text-sm font-semibold text-white">
                      {section.icon}
                      {section.title}
                    </div>

                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mt-4">
                    {methodology[section.key]}
                  </p>

                </div>

              )
            )}

          </div>

        )}

      </Card>

      {/* ===================================================
          SECTION 7 — CITATIONS
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="07"
          icon={
            <Quote className="w-5 h-5 text-emerald-400" />
          }
          title="Verified Citations"
          badge={`${citations.length} References`}
        />

        <div className="space-y-3">

          {citations.map((citation, index) => (

            <div
              key={`${citation.doi || citation.title}-${index}`}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800"
            >

              <div className="flex items-start gap-3">

                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {index + 1}
                </span>

                <div className="min-w-0">

                  <h4 className="text-sm font-semibold text-white">
                    {citation.title}
                  </h4>

                  <p className="text-xs text-slate-400 mt-1">
                    {citation.authors.join(', ')}
                    {citation.year
                      ? ` • ${citation.year}`
                      : ''}
                    {citation.venue
                      ? ` • ${citation.venue}`
                      : ''}
                  </p>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {citation.citation_text}
                  </p>

                  {citation.doi && (
                    <div className="mt-2 text-[10px] font-mono text-blue-400">
                      DOI: {citation.doi}
                    </div>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      </Card>

      {/* ===================================================
          SECTION 8 — REVIEWER
      =================================================== */}

      <Card className="space-y-5">

        <SectionHeader
          number="08"
          icon={
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          }
          title="Reviewer Validation"
          badge="Final Quality Gate"
        />

        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <div>

              <h4 className="text-sm font-semibold text-white">
                Automated Research Quality Review
              </h4>

              <p className="text-[11px] text-slate-500">
                Reviewer Agent validation
              </p>

            </div>

          </div>

          <div className="whitespace-pre-line text-xs text-slate-300 leading-relaxed">
            {reviewerFeedback?.reviewer_feedback ||
              'Reviewer feedback is not available.'}
          </div>

        </div>

      </Card>

      {/* ===================================================
          HUMAN APPROVAL GATE
      =================================================== */}

      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-slate-900 space-y-5">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2">

              <ShieldCheck className="w-6 h-6 text-blue-400" />

              <h3 className="text-lg font-bold text-white">
                Student Approval Gate
              </h3>

            </div>

            <p className="text-xs text-slate-400 mt-1">
              Final research decisions remain under human
              control.
            </p>

          </div>

          {approvalBadge}

        </div>

        <div>

          <label className="block text-xs font-medium text-slate-300 mb-2">
            Student Notes / Revision Guidance
          </label>

          <textarea
            value={studentNotes}
            onChange={(event) =>
              setStudentNotes(event.target.value)
            }
            placeholder="Add notes, requested changes, or approval comments..."
            className="w-full min-h-[110px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-y"
          />

        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-800">

          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              handleDecision('rejected')
            }
            icon={
              <XCircle className="w-4 h-4" />
            }
          >
            Reject Plan
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              handleDecision(
                'changes_requested'
              )
            }
            icon={
              <AlertCircle className="w-4 h-4 text-amber-400" />
            }
          >
            Request Changes
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              handleDecision('approved')
            }
            icon={
              <CheckCircle2 className="w-4 h-4" />
            }
          >
            Approve Research Plan
          </Button>

        </div>

      </Card>

      {/* ===================================================
          PIPELINE FOOTER
      =================================================== */}

      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/50">

        <div className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-4">
          ResearchFlow Pipeline
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px]">

          <PipelineStage label="Research Evidence" />

          <span className="text-slate-700">→</span>

          <PipelineStage label="Gap & Idea Validation" />

          <span className="text-slate-700">→</span>

          <PipelineStage label="Reviewer Agent" />

          <span className="text-slate-700">→</span>

          <PipelineStage
            label="Final Research Plan"
            active
          />

          <span className="text-slate-700">→</span>

          <PipelineStage label="Human Approval" />

        </div>

      </div>

    </div>
  );
};

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

interface SectionHeaderProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
}

const SectionHeader: React.FC<
  SectionHeaderProps
> = ({ number, icon, title, badge }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">

    <div className="flex items-center gap-3">

      <span className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-500">
        {number}
      </span>

      <div className="flex items-center gap-2">

        {icon}

        <h3 className="text-base md:text-lg font-bold text-white">
          {title}
        </h3>

      </div>

    </div>

    <Badge variant="blue">
      {badge}
    </Badge>

  </div>
);

interface InfoBoxProps {
  label: string;
  value: string;
  highlight?: boolean;
}

const InfoBox: React.FC<InfoBoxProps> = ({
  label,
  value,
  highlight = false,
}) => (
  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">

    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">
      {label}
    </div>

    <div
      className={`text-xs leading-relaxed mt-1 ${
        highlight
          ? 'text-emerald-300'
          : 'text-slate-300'
      }`}
    >
      {value}
    </div>

  </div>
);

interface PipelineStageProps {
  label: string;
  active?: boolean;
}

const PipelineStage: React.FC<
  PipelineStageProps
> = ({ label, active = false }) => (
  <span
    className={`px-3 py-1.5 rounded-lg border ${
      active
        ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
        : 'border-slate-800 bg-slate-900 text-slate-500'
    }`}
  >
    {label}
  </span>
);