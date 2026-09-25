import React, { useState, useEffect } from 'react';
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
  Calendar
} from 'lucide-react';
import { agentService } from '../../services/agentService';
import type { 
  FinalResearchPlan, 
  ResearchPaper, 
  ComparisonMatrixRow, 
  ResearchGap as ResearchGapType, 
  SuggestedIdea, 
  MethodologyStep, 
  CitationItem, 
  ReviewerFeedbackItem 
} from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const FinalPlan: React.FC = () => {
  const [plan, setPlan] = useState<FinalResearchPlan | null>(null);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [comparisons, setComparisons] = useState<ComparisonMatrixRow[]>([]);
  const [gaps, setGaps] = useState<ResearchGapType[]>([]);
  const [ideas, setIdeas] = useState<SuggestedIdea[]>([]);
  const [methodology, setMethodology] = useState<MethodologyStep[]>([]);
  const [citations, setCitations] = useState<CitationItem[]>([]);
  const [reviewerFeedback, setReviewerFeedback] = useState<ReviewerFeedbackItem[]>([]);
  
  const [studentNotes, setStudentNotes] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      try {
        const [
          planData, 
          paperData, 
          compData, 
          gapData, 
          methData, 
          citData, 
          revData
        ] = await Promise.all([
          agentService.getFinalPlan(),
          agentService.getPapers(),
          agentService.getComparisonMatrix(),
          agentService.getGapsAndIdeas(),
          agentService.getMethodology(),
          agentService.getCitations(),
          agentService.getReviewerFeedback()
        ]);
        setPlan(planData);
        setPapers(paperData);
        setComparisons(compData);
        setGaps(gapData.gaps);
        setIdeas(gapData.ideas);
        setMethodology(methData);
        setCitations(citData);
        setReviewerFeedback(revData);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  async function handleDecision(decision: 'approved' | 'rejected' | 'changes_requested') {
    const res = await agentService.submitPlanApproval(decision, studentNotes);
    setPlan({ ...res.updatedPlan });
    
    if (decision === 'approved') {
      setStatusMessage('Research Plan successfully Approved! Autonomous workflow execution initiated.');
    } else if (decision === 'changes_requested') {
      setStatusMessage('Revision requested. Upstream agents have been notified with your feedback notes.');
    } else {
      setStatusMessage('Research Plan rejected. You may formulate a new topic in the Research Workspace.');
    }

    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  }

  function exportPlan() {
    alert('Exporting Final Synthesized Research Plan to LaTeX and Markdown...');
  }

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading synthesized research plan...
      </div>
    );
  }

  const approvalBadge = {
    approved: <Badge variant="emerald" size="md">Approved by Student</Badge>,
    pending_review: <Badge variant="amber" size="md" pulse>Pending Student Review</Badge>,
    changes_requested: <Badge variant="blue" size="md">Changes Requested</Badge>,
    rejected: <Badge variant="rose" size="md">Plan Rejected</Badge>
  }[plan.humanApprovalStatus];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 rounded-2xl p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                PLAN ID: {plan.projectId}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Generated: {plan.generatedDate}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Final Synthesized Research Plan
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Topic: <strong className="text-white">{plan.topic}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {approvalBadge}
            <Button variant="secondary" size="sm" onClick={exportPlan} icon={<Download className="w-4 h-4" />}>
              Export Plan (LaTeX / PDF)
            </Button>
          </div>
        </div>

        {statusMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Human Student Approval Control Bar */}
      <Card className="space-y-4 border-blue-500/40 bg-slate-900/90 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Student Approval Gate (Human-in-the-Loop)
          </h3>
          <span className="text-xs text-slate-400">Required before downstream experiments proceed</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Student Revisions / Guidance Notes (Optional)
          </label>
          <textarea
            value={studentNotes}
            onChange={e => setStudentNotes(e.target.value)}
            placeholder="Add notes for downstream agents (e.g. 'Prioritize latency benchmarks over ablation on HotpotQA', or 'Approve with 10% lower threshold')..."
            className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <Button 
            variant="danger" 
            size="sm" 
            onClick={() => handleDecision('rejected')}
            icon={<XCircle className="w-4 h-4" />}
          >
            Reject
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => handleDecision('changes_requested')}
            icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
          >
            Request Changes
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => handleDecision('approved')}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            Approve Research Plan
          </Button>
        </div>
      </Card>

      {/* 8 Comprehensive Research Plan Sections */}
      <div className="space-y-8">
        {/* Section 1: Literature Synthesis */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" /> 1. Literature Agent Synthesis
            </h3>
            <Badge variant="blue">{papers.length} Candidate Papers Filtered</Badge>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            High-impact publications retrieved and filtered across NeurIPS, ICLR, and ACL directly relating to speculative consensus and multi-agent reasoning.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {papers.slice(0, 4).map(p => (
              <div key={p.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-1">{p.title}</span>
                  <Badge variant="purple">{p.year}</Badge>
                </div>
                <div className="text-[11px] text-slate-400">{p.authors.join(', ')} • {p.venue}</div>
                <div className="text-xs text-slate-300 line-clamp-2">{p.summary}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 2: Paper Intelligence Deep-Extraction */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" /> 2. Paper Intelligence Extraction
            </h3>
            <Badge variant="purple">Methodology & Datasets</Badge>
          </div>
          <div className="space-y-3">
            {papers.slice(0, 3).map(p => (
              <div key={p.id} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-200">{p.title}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block font-medium">Extracted Methodology:</span>
                    <span className="text-slate-200 mt-0.5 block">{p.methodology}</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded border border-slate-800">
                    <span className="text-slate-400 block font-medium">Benchmark Datasets:</span>
                    <span className="text-emerald-300 font-mono mt-0.5 block">{p.dataset}</span>
                  </div>
                </div>
                <div className="text-slate-300">
                  <strong className="text-slate-400">Reported Benchmark:</strong> {p.results}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 3: Cross-Paper Comparison Matrix */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-emerald-400" /> 3. Cross-Paper Comparison Matrix
            </h3>
            <Badge variant="emerald">Comparative Matrix</Badge>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-mono uppercase tracking-wider border-b border-slate-800">
                  <th className="p-3">Paper</th>
                  <th className="p-3">Methodology</th>
                  <th className="p-3">Dataset</th>
                  <th className="p-3">Results</th>
                  <th className="p-3">Limitations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {comparisons.map(c => (
                  <tr key={c.paperId} className="hover:bg-slate-850/50">
                    <td className="p-3 font-medium text-slate-200">{c.paperTitle}</td>
                    <td className="p-3 text-slate-300">{c.methodology}</td>
                    <td className="p-3 text-emerald-300 font-mono text-[11px]">{c.dataset}</td>
                    <td className="p-3 text-blue-300">{c.results}</td>
                    <td className="p-3 text-rose-300/90">{c.limitations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section 4: Research Gaps */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" /> 4. Identified Research Gaps
            </h3>
            <Badge variant="rose">Literature Blindspots</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gaps.map(g => (
              <div key={g.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="rose">Impact: {g.impactScore}/10</Badge>
                  <span className="text-[11px] font-mono text-slate-400">Feasibility: {g.feasibilityScore}/10</span>
                </div>
                <h4 className="font-semibold text-white">{g.title}</h4>
                <p className="text-slate-300 leading-relaxed">{g.description}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Sources: {g.sourcePaperTitles.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 5: Suggested Ideas & Novel Hypotheses */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> 5. Formulated Novel Hypotheses & Architecture
            </h3>
            <Badge variant="amber">Idea Agent</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map(idea => (
              <div key={idea.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="emerald">Effort: ~{idea.estimatedEffortWeeks} Weeks</Badge>
                  <span className="font-mono text-blue-400">{idea.targetGapId}</span>
                </div>
                <h4 className="font-bold text-white text-sm">{idea.title}</h4>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-slate-300">
                  <strong className="text-blue-400">Core Hypothesis:</strong> {idea.coreHypothesis}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-300">Architecture:</strong> {idea.recommendedArchitecture}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 6: Recommended Methodology Protocol */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" /> 6. Recommended Methodology Protocol
            </h3>
            <Badge variant="blue">Phased Execution</Badge>
          </div>
          <div className="space-y-3">
            {methodology.map(step => (
              <div key={step.stepNumber} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
                <span className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0">
                  0{step.stepNumber}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="font-semibold text-white">{step.title}</div>
                  <div className="text-slate-300">{step.description}</div>
                  <div className="text-[11px] font-mono text-blue-400">Tools: {step.recommendedTools.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 7: Academic Citations */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Quote className="w-5 h-5 text-emerald-400" /> 7. Verified Citations & Bibliography
            </h3>
            <Badge variant="emerald">{citations.length} References</Badge>
          </div>
          <div className="space-y-2">
            {citations.map(c => (
              <div key={c.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="sm">{c.format}</Badge>
                    <span className="font-semibold text-slate-200">{c.paperTitle}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] font-mono truncate max-w-2xl">{c.rawCitation}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Section 8: Simulated Peer Reviewer Feedback */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> 8. Simulated Peer Reviewer Feedback
            </h3>
            <Badge variant="emerald">Score: 8.8 / 10.0</Badge>
          </div>
          <div className="space-y-3">
            {reviewerFeedback.map((rf, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={rf.severity === 'high' ? 'rose' : rf.severity === 'medium' ? 'amber' : 'blue'}>
                      {rf.category} • {rf.severity.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-white">{rf.title}</span>
                  </div>
                </div>
                <p className="text-slate-300">{rf.detail}</p>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-emerald-300">
                  <strong className="text-white">Actionable Suggestion:</strong> {rf.actionableSuggestion}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Floating/Sticky Action Bar for Quick Approval */}
      <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-4 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-white">Student Review Decision</div>
          <div className="text-[11px] text-slate-400">Current status: {plan.humanApprovalStatus.replace('_', ' ').toUpperCase()}</div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="danger" size="sm" onClick={() => handleDecision('rejected')}>
            Reject
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleDecision('changes_requested')}>
            Request Changes
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleDecision('approved')} icon={<CheckCircle2 className="w-4 h-4" />}>
            Approve Research Plan
          </Button>
        </div>
      </div>
    </div>
  );
};
