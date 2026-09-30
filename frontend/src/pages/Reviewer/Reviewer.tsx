import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Lightbulb,
  BookOpenCheck,
  BrainCircuit,
  Activity,
  ArrowRight,
  CircleAlert,
} from 'lucide-react';

import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

interface ReviewData {
  reviewerText: string;
  gapsCount: number;
  ideasCount: number;
  methodologyReady: boolean;
  citationsCount: number;
}

interface CheckItem {
  title: string;
  description: string;
  status: 'ready' | 'attention';
  icon: React.ReactNode;
}

export const Reviewer: React.FC = () => {
  const [data, setData] = useState<ReviewData>({
    reviewerText: '',
    gapsCount: 0,
    ideasCount: 0,
    methodologyReady: false,
    citationsCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviewerData = async () => {
      try {
        const [
          reviewerResponse,
          gapsResponse,
          methodologyResponse,
          citationsResponse,
        ] = await Promise.allSettled([
          agentService.getReviewerFeedback(),
          agentService.getGapsAndIdeas(),
          agentService.getMethodology(),
          agentService.getCitations(),
        ]);

        let reviewerText = '';

        if (reviewerResponse.status === 'fulfilled') {
          const raw: any = reviewerResponse.value;

          if (typeof raw === 'string') {
            reviewerText = raw;
          } else if (
            raw &&
            typeof raw === 'object' &&
            'reviewer_feedback' in raw
          ) {
            reviewerText = String(raw.reviewer_feedback || '');
          } else if (Array.isArray(raw)) {
            reviewerText = raw
              .map(
                (item: any) =>
                  item.detail ||
                  item.message ||
                  item.title ||
                  ''
              )
              .filter(Boolean)
              .join('\n');
          }
        }

        let gapsCount = 0;
        let ideasCount = 0;

        if (gapsResponse.status === 'fulfilled') {
          const gapData: any = gapsResponse.value;

          gapsCount = Array.isArray(gapData?.research_gaps)
            ? gapData.research_gaps.length
            : 0;

          ideasCount = Array.isArray(gapData?.research_ideas)
            ? gapData.research_ideas.length
            : 0;
        }

        let methodologyReady = false;

        if (methodologyResponse.status === 'fulfilled') {
          const methodology: any = methodologyResponse.value;

          const requiredFields = [
            'problem_definition',
            'research_objective',
            'data_collection',
            'preprocessing',
            'baseline_models',
            'proposed_approach',
            'training_strategy',
            'evaluation',
            'explainability',
            'expected_outcome',
          ];

          methodologyReady = requiredFields.every(
            (field) =>
              methodology?.[field] &&
              methodology[field] !== 'Not available'
          );
        }

        let citationsCount = 0;

        if (citationsResponse.status === 'fulfilled') {
          const citations: any = citationsResponse.value;

          citationsCount = Array.isArray(citations)
            ? citations.length
            : 0;
        }

        setData({
          reviewerText,
          gapsCount,
          ideasCount,
          methodologyReady,
          citationsCount,
        });
      } catch (error) {
        console.error(
          'Failed to load reviewer dashboard:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviewerData();
  }, []);

  const reviewPassed =
    data.reviewerText.includes('REVIEW PASSED');

  const hasAttention =
    data.reviewerText.includes('REVIEW REQUIRES ATTENTION') ||
    data.ideasCount === 0;

  const checks: CheckItem[] = [
    {
      title: 'Research Problem',
      description:
        'Research problem is available for reviewer validation.',
      status: 'ready',
      icon: <BrainCircuit className="w-5 h-5" />,
    },
    {
      title: 'Research Gaps',
      description:
        data.gapsCount > 0
          ? `${data.gapsCount} research gap(s) available.`
          : 'No research gaps available.',
      status: data.gapsCount > 0 ? 'ready' : 'attention',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: 'Research Ideas',
      description:
        data.ideasCount > 0
          ? `${data.ideasCount} research idea(s) generated.`
          : 'No research ideas have been generated.',
      status: data.ideasCount > 0 ? 'ready' : 'attention',
      icon: <Lightbulb className="w-5 h-5" />,
    },
    {
      title: 'Methodology',
      description: data.methodologyReady
        ? 'Complete methodology is available.'
        : 'Methodology requires attention.',
      status: data.methodologyReady
        ? 'ready'
        : 'attention',
      icon: <FileCheck2 className="w-5 h-5" />,
    },
    {
      title: 'Citations',
      description:
        data.citationsCount > 0
          ? `${data.citationsCount} citation(s) available.`
          : 'No citations available.',
      status:
        data.citationsCount > 0
          ? 'ready'
          : 'attention',
      icon: <BookOpenCheck className="w-5 h-5" />,
    },
  ];

  const readyChecks = checks.filter(
    (item) => item.status === 'ready'
  ).length;

  const readinessPercentage = Math.round(
    (readyChecks / checks.length) * 100
  );

  const issueLines = data.reviewerText
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.startsWith('-') ||
        line.startsWith('•')
    );

  return (
    <div className="space-y-6">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6">

        <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

          <div>
            <div className="flex items-center gap-2">
              <Badge variant="emerald">
                Reviewer Agent
              </Badge>

              <span className="text-[10px] text-slate-500 font-mono">
                FINAL VALIDATION
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white mt-3 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              AI Research Quality Review
            </h2>

            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Automated validation of the research problem,
              research gaps, proposed ideas, methodology and
              citation completeness before final plan approval.
            </p>
          </div>

          {/* Status */}
          <div
            className={`min-w-[190px] rounded-xl border px-5 py-4 ${
              reviewPassed
                ? 'border-emerald-500/30 bg-emerald-500/10'
                : 'border-amber-500/30 bg-amber-500/10'
            }`}
          >
            <div className="flex items-center gap-2">
              {reviewPassed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              )}

              <span className="text-[11px] uppercase tracking-wider text-slate-400">
                Review Status
              </span>
            </div>

            <p
              className={`text-lg font-bold mt-1 ${
                reviewPassed
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {reviewPassed
                ? 'Review Passed'
                : 'Needs Attention'}
            </p>

            <p className="text-[11px] text-slate-500 mt-1">
              Automated Reviewer Agent
            </p>
          </div>

        </div>
      </div>


      {/* ====================================================== */}
      {/* SUMMARY CARDS */}
      {/* ====================================================== */}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

          <Card className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Readiness
                </p>

                <p className="text-3xl font-bold text-white mt-2">
                  {readinessPercentage}%
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {readyChecks} of {checks.length} checks ready
                </p>
              </div>

              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  readinessPercentage === 100
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
                style={{
                  width: `${readinessPercentage}%`,
                }}
              />
            </div>
          </Card>


          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Research Gaps
                </p>

                <p className="text-3xl font-bold text-white mt-2">
                  {data.gapsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Identified research directions
                </p>
              </div>

              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </Card>


          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Research Ideas
                </p>

                <p className="text-3xl font-bold text-white mt-2">
                  {data.ideasCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Candidate research directions
                </p>
              </div>

              <div
                className={`p-2 rounded-lg ${
                  data.ideasCount > 0
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
              </div>
            </div>
          </Card>


          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  Citations
                </p>

                <p className="text-3xl font-bold text-white mt-2">
                  {data.citationsCount}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Literature references
                </p>
              </div>

              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <BookOpenCheck className="w-5 h-5" />
              </div>
            </div>
          </Card>

        </div>
      )}


      {/* ====================================================== */}
      {/* QUALITY CHECKS */}
      {/* ====================================================== */}

      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-white">
              Research Quality Checks
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Component-level validation performed before
              final research plan generation.
            </p>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            {readyChecks}/{checks.length} READY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

          {checks.map((check) => (
            <Card
              key={check.title}
              className={`relative overflow-hidden ${
                check.status === 'ready'
                  ? 'border-emerald-500/20'
                  : 'border-amber-500/20'
              }`}
            >
              <div className="flex items-center justify-between">

                <div
                  className={`p-2 rounded-lg ${
                    check.status === 'ready'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {check.icon}
                </div>

                {check.status === 'ready' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}

              </div>

              <h4 className="text-sm font-semibold text-white mt-4">
                {check.title}
              </h4>

              <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                {check.description}
              </p>

              <div
                className={`text-[9px] font-bold uppercase tracking-wider mt-4 ${
                  check.status === 'ready'
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {check.status === 'ready'
                  ? '✓ Ready'
                  : '⚠ Attention'}
              </div>

            </Card>
          ))}

        </div>
      </div>


      {/* ====================================================== */}
      {/* REVIEW FINDINGS */}
      {/* ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Main findings */}
        <Card className="xl:col-span-2">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Reviewer Findings
              </h3>

              <p className="text-[11px] text-slate-500 mt-1">
                Findings returned by the Reviewer Agent.
              </p>
            </div>

            <Badge
              variant={
                hasAttention
                  ? 'amber'
                  : 'emerald'
              }
            >
              {hasAttention
                ? 'Attention Required'
                : 'Validated'}
            </Badge>

          </div>


          {loading ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">
                Loading reviewer analysis...
              </p>
            </div>
          ) : (
            <div className="space-y-3">

              {issueLines.length > 0 ? (
                issueLines.map((issue, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5"
                  >
                    <div className="mt-0.5">
                      <CircleAlert className="w-5 h-5 text-amber-400" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-amber-300">
                        Review Issue {index + 1}
                      </p>

                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {issue.replace(/^[-•]\s*/, '')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-300">
                        No blocking issues detected
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        The Reviewer Agent found no structural
                        issues requiring attention.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </Card>


        {/* Recommendation */}
        <Card>

          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <ArrowRight className="w-4 h-4" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                Next Action
              </h3>

              <p className="text-[10px] text-slate-500">
                Reviewer recommendation
              </p>
            </div>
          </div>


          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">

            {hasAttention ? (
              <>
                <p className="text-xs font-semibold text-amber-300">
                  Address identified issues
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Resolve the highlighted reviewer findings
                  before treating the research workflow as
                  ready for finalization.
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-emerald-300">
                  Research plan is structurally ready
                </p>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  The Reviewer Agent has completed automated
                  validation. The next step is final research
                  plan generation followed by human approval.
                </p>
              </>
            )}

          </div>

        </Card>

      </div>


      {/* ====================================================== */}
      {/* WORKFLOW POSITION */}
      {/* ====================================================== */}

      <Card>

        <div className="flex items-center justify-between mb-5">

          <div>
            <h3 className="text-sm font-bold text-white">
              Research Validation Pipeline
            </h3>

            <p className="text-[11px] text-slate-500 mt-1">
              Current position of the Reviewer Agent in the
              ResearchFlow pipeline.
            </p>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            FINAL QUALITY GATE
          </span>

        </div>


        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">

          <div className="flex-1 p-3 rounded-lg border border-slate-800 bg-slate-950">
            <p className="text-[9px] uppercase text-slate-500">
              Stage 01
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Research Evidence
            </p>
          </div>

          <ArrowRight className="hidden md:block w-4 h-4 text-slate-600" />

          <div className="flex-1 p-3 rounded-lg border border-slate-800 bg-slate-950">
            <p className="text-[9px] uppercase text-slate-500">
              Stage 02
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Gap & Idea Validation
            </p>
          </div>

          <ArrowRight className="hidden md:block w-4 h-4 text-slate-600" />

          <div className="flex-1 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
            <p className="text-[9px] uppercase text-emerald-500">
              Stage 03
            </p>
            <p className="text-xs text-emerald-300 mt-1">
              Reviewer Agent
            </p>
          </div>

          <ArrowRight className="hidden md:block w-4 h-4 text-slate-600" />

          <div className="flex-1 p-3 rounded-lg border border-slate-800 bg-slate-950">
            <p className="text-[9px] uppercase text-slate-500">
              Stage 04
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Final Research Plan
            </p>
          </div>

          <ArrowRight className="hidden md:block w-4 h-4 text-slate-600" />

          <div className="flex-1 p-3 rounded-lg border border-slate-800 bg-slate-950">
            <p className="text-[9px] uppercase text-slate-500">
              Stage 05
            </p>
            <p className="text-xs text-slate-200 mt-1">
              Human Approval
            </p>
          </div>

        </div>

      </Card>


      {/* ====================================================== */}
      {/* FOOTER NOTE */}
      {/* ====================================================== */}

      <div className="flex items-start gap-3 px-1 pb-4">

        <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5" />

        <p className="text-[11px] text-slate-500 leading-relaxed">
          The Reviewer Agent performs automated structural
          validation. It does not replace human research
          judgment. Final approval of the proposed research
          plan remains with the student.
        </p>

      </div>

    </div>
  );
};