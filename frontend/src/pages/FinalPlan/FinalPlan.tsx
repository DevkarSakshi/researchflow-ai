import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  FileDown,
  ArrowLeft
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowIdParam = searchParams.get('id') || undefined;

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    async function loadAllData() {
      setLoading(true);
      setError(null);
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
          agentService.getFinalPlan(workflowIdParam),
          agentService.getPapers(workflowIdParam),
          agentService.getComparisonMatrix(workflowIdParam),
          agentService.getGapsAndIdeas(workflowIdParam),
          agentService.getMethodology(workflowIdParam),
          agentService.getCitations(workflowIdParam),
          agentService.getReviewerFeedback(workflowIdParam)
        ]);
        setPlan(planData);
        setPapers(paperData);
        setComparisons(compData);
        setGaps(gapData.gaps);
        setIdeas(gapData.ideas);
        setMethodology(methData);
        setCitations(citData);
        setReviewerFeedback(revData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load the research plan.');
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, [workflowIdParam]);


  async function handleDecision(decision: 'approved' | 'rejected' | 'changes_requested') {
    setError(null);
    if (decision === 'approved' && !deadline) {
      setError('Set a project deadline before approving the plan.');
      return;
    }

    try {
      await agentService.submitPlanApproval(decision, studentNotes, deadline || undefined);
      const updatedPlan = await agentService.getFinalPlan();
      setPlan(updatedPlan);
      if (decision === 'approved') {
        setStatusMessage('Research plan approved and academic tasks created from its methodology and deliverables.');
      } else if (decision === 'changes_requested') {
        setStatusMessage('Change request saved with your notes.');
      } else {
        setStatusMessage('Plan rejection saved.');
      }
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not save the decision.');
    }
  }

  function downloadFullPlanPDF() {
    if (!plan) return;

    // Generate self-contained, publication-ready academic HTML document for clean PDF printing/saving
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ResearchFlow_Plan_${plan.projectId}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      font-size: 11pt;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    .header {
      border-bottom: 2.5pt solid #2563eb;
      padding-bottom: 12pt;
      margin-bottom: 18pt;
    }
    .badge-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6pt;
    }
    .badge {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 3pt 8pt;
      border-radius: 4pt;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1pt solid #bfdbfe;
    }
    .status-badge {
      display: inline-block;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 3pt 8pt;
      border-radius: 4pt;
      background: #ecfdf5;
      color: #047857;
      border: 1pt solid #a7f3d0;
    }
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #0f172a;
      margin: 6pt 0 6pt 0;
      line-height: 1.2;
    }
    .topic {
      font-size: 12pt;
      color: #334155;
      margin: 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8pt;
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      border-radius: 6pt;
      padding: 10pt 14pt;
      margin-bottom: 18pt;
      font-size: 9.5pt;
    }
    .meta-item strong {
      color: #1e293b;
    }
    h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #1e3a8a;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 4pt;
      margin-top: 18pt;
      margin-bottom: 10pt;
      page-break-after: avoid;
    }
    h3 {
      font-size: 11pt;
      font-weight: 700;
      color: #0f172a;
      margin: 8pt 0 4pt 0;
    }
    p {
      margin: 0 0 6pt 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0 16pt 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }
    th, td {
      border: 1pt solid #cbd5e1;
      padding: 6pt 8pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #f1f5f9;
      font-weight: 700;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .card {
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      border-radius: 6pt;
      padding: 10pt 12pt;
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    .card-title {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4pt;
    }
    .tags {
      margin-top: 4pt;
      font-size: 8.5pt;
      color: #475569;
    }
    .method-step {
      border-left: 3pt solid #2563eb;
      padding-left: 10pt;
      margin-bottom: 12pt;
      page-break-inside: avoid;
    }
    .citation-block {
      background: #f8fafc;
      border: 1pt solid #e2e8f0;
      border-radius: 4pt;
      padding: 8pt 10pt;
      font-family: monospace;
      font-size: 8pt;
      margin-bottom: 8pt;
      white-space: pre-wrap;
      word-break: break-all;
      page-break-inside: avoid;
    }
    .reviewer-item {
      border-left: 3pt solid #f59e0b;
      padding-left: 10pt;
      margin-bottom: 10pt;
      page-break-inside: avoid;
    }
    .suggestion {
      background: #ecfdf5;
      border: 1pt solid #a7f3d0;
      border-radius: 4pt;
      padding: 6pt 8pt;
      font-size: 9pt;
      color: #065f46;
      margin-top: 4pt;
    }
    .footer {
      margin-top: 24pt;
      border-top: 1pt solid #e2e8f0;
      padding-top: 8pt;
      font-size: 8pt;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge-bar">
      <span class="badge">ResearchFlow AI • 9-Agent Pipeline</span>
      <span class="status-badge">${plan.humanApprovalStatus.replace('_', ' ').toUpperCase()}</span>
    </div>
    <h1>${plan.topic}</h1>
    <div class="topic">Synthesized Autonomous Academic Research Plan</div>
  </div>

  <div class="meta-grid">
    <div class="meta-item"><strong>Plan ID:</strong> ${plan.projectId}</div>
    <div class="meta-item"><strong>Generated Date:</strong> ${plan.generatedDate}</div>
    <div class="meta-item"><strong>Human Approval Status:</strong> ${plan.humanApprovalStatus.replace('_', ' ').toUpperCase()}</div>
    <div class="meta-item"><strong>Total Analyzed Sources:</strong> ${papers.length} publications</div>
  </div>

  <h2>1. Problem Statement & Novel Hypothesis</h2>
  <div class="card">
    <div class="card-title">Research Problem:</div>
    <p>${plan.problemStatement}</p>
    <div class="card-title" style="margin-top: 8pt;">Core Novel Hypothesis:</div>
    <p style="color: #1d4ed8; font-weight: 600;">${plan.novelHypothesis}</p>
    <div class="card-title" style="margin-top: 8pt;">Methodology Summary:</div>
    <p>${plan.methodologySummary}</p>
  </div>

  <h2>2. Academic Literature Synthesis (${papers.length} Papers)</h2>
  ${papers.map((p, i) => `
    <div class="card">
      <div class="card-title">${i + 1}. ${p.title} (${p.year ?? 'Year not reported'})</div>
      <p><strong>Authors:</strong> ${p.authors.join(', ')}</p>
      <p><strong>Venue:</strong> ${p.venue} ${p.citation ? '• ' + p.citation : ''}</p>
      <p><strong>Summary:</strong> ${p.summary}</p>
      <div class="tags"><strong>Methodology:</strong> ${p.methodology} | <strong>Dataset:</strong> ${p.dataset}</div>
    </div>
  `).join('')}

  <h2>3. Cross-Paper Comparative Matrix</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Paper Title</th>
        <th style="width: 10%;">Year</th>
        <th style="width: 25%;">Methodology</th>
        <th style="width: 15%;">Dataset</th>
        <th style="width: 25%;">Results & Limitations</th>
      </tr>
    </thead>
    <tbody>
      ${comparisons.map(c => `
        <tr>
          <td><strong>${c.paperTitle}</strong></td>
          <td>${c.year ?? 'N/A'}</td>
          <td>${c.methodology}</td>
          <td><code>${c.dataset}</code></td>
          <td>${c.results}<br><small style="color: #b91c1c;">Limitation: ${c.limitations}</small></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>4. Research Gaps & Identified Opportunities</h2>
  ${gaps.map((g, i) => `
    <div class="card">
      <div class="card-title">Gap ${i + 1}: ${g.title}</div>
      <p>${g.description}</p>
      <div class="tags"><strong>Source Papers:</strong> ${g.sourcePaperTitles.join('; ')}</div>
    </div>
  `).join('')}

  <h2>5. Candidate Research Hypotheses & Ideas</h2>
  ${ideas.map((idea, i) => `
    <div class="card">
      <div class="card-title">Candidate Idea ${i + 1}: ${idea.title}</div>
      <p><strong>Core Hypothesis:</strong> ${idea.coreHypothesis}</p>
      <p><strong>Rationale:</strong> ${idea.rationale}</p>
      <p><strong>Proposed Architecture:</strong> ${idea.recommendedArchitecture}</p>
      ${idea.estimatedEffortWeeks ? `<div class="tags"><strong>Estimated Effort:</strong> ${idea.estimatedEffortWeeks} weeks</div>` : ''}
    </div>
  `).join('')}

  <h2>6. Recommended Step-by-Step Methodology</h2>
  ${methodology.map(step => `
    <div class="method-step">
      <div class="card-title">Step ${step.stepNumber}: ${step.title}</div>
      <p>${step.description}</p>
      <p style="font-size: 9pt;"><strong>Inputs:</strong> ${step.inputs.join(', ')}</p>
      <p style="font-size: 9pt;"><strong>Outputs / Deliverables:</strong> ${step.outputs.join(', ')}</p>
      <div class="tags"><strong>Recommended Tools / Frameworks:</strong> ${step.recommendedTools.join(', ')}</div>
    </div>
  `).join('')}

  <h2>7. Verified Academic Citations & Bibliography</h2>
  ${citations.map((c, i) => `
    <div style="margin-bottom: 10pt; font-size: 9pt;">
      <div><strong>[${i + 1}]</strong> ${c.authors} (${c.year ?? 'n.d.'}). <em>${c.paperTitle}</em>.</div>
      <div class="citation-block">${c.rawCitation}</div>
    </div>
  `).join('')}

  <h2>8. Reviewer Agent Critical Feedback</h2>
  ${reviewerFeedback.map(fb => `
    <div class="reviewer-item">
      <div class="card-title">${fb.category} • Severity: ${fb.severity.toUpperCase()}</div>
      <p><strong>${fb.title}</strong></p>
      <p>${fb.detail}</p>
      <div class="suggestion"><strong>Actionable Suggestion:</strong> ${fb.actionableSuggestion}</div>
    </div>
  `).join('')}

  ${studentNotes ? `
    <h2>9. Student Notes & Human Review Comments</h2>
    <div class="card">
      <p>${studentNotes}</p>
    </div>
  ` : ''}

  <div class="footer">
    Synthesized and Exported by ResearchFlow AI — Multi-Agent Academic Research OS<br>
    Document generated on ${new Date().toLocaleDateString()} for Plan ${plan.projectId}
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      // Fallback: If popup blocker prevents window.open, trigger blob download
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ResearchFlow_Full_Plan_${plan.projectId}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  }

  function exportPlanMarkdown() {
    if (!plan) return;

    const lines: string[] = [
      `# Final Synthesized Research Plan`,
      ``,
      `**Plan ID:** ${plan.projectId}`,
      `**Topic:** ${plan.topic}`,
      `**Generated:** ${plan.generatedDate}`,
      `**Approval Status:** ${plan.humanApprovalStatus}`,
      ``,
      `---`,
      ``,
      `## 1. Literature Agent Synthesis`,
      ``,
      ...papers.slice(0, 4).map(p =>
        `### ${p.title} (${p.year ?? 'Year not reported'})\n- **Authors:** ${p.authors.join(', ')}\n- **Venue:** ${p.venue}\n- **Summary:** ${p.summary}\n`
      ),
      `---`,
      ``,
      `## 2. Paper Intelligence Extraction`,
      ``,
      ...papers.slice(0, 3).map(p =>
        `### ${p.title}\n- **Methodology:** ${p.methodology}\n- **Dataset:** ${p.dataset}\n- **Citation:** ${p.citation}\n`
      ),
      `---`,
      ``,
      `## 3. Comparison Matrix`,
      ``,
      `| Paper | Year | Methodology | Results | Limitations |`,
      `|-------|------|-------------|---------|-------------|`,
      ...comparisons.map(r =>
        `| ${r.paperTitle} | ${r.year ?? 'Year not reported'} | ${r.methodology} | ${r.results} | ${r.limitations} |`
      ),
      ``,
      `---`,
      ``,
      `## 4. Research Gaps`,
      ``,
      ...gaps.map((g, i) =>
        `### Gap ${i + 1}: ${g.title}\n${g.description}\n- **Sources:** ${g.sourcePaperTitles.join(', ')}\n`
      ),
      `---`,
      ``,
      `## 5. Suggested Research Ideas`,
      ``,
      ...ideas.map((idea, i) =>
        `### Candidate ${i + 1}: ${idea.title}\n**Hypothesis:** ${idea.coreHypothesis}\n**Rationale:** ${idea.rationale}\n- **Proposed approach:** ${idea.recommendedArchitecture}\n`
      ),
      `---`,
      ``,
      `## 6. Recommended Methodology`,
      ``,
      ...methodology.map(step =>
        `### Step ${step.stepNumber}: ${step.title}\n${step.description}\n- **Inputs:** ${step.inputs.join(', ')}\n- **Outputs:** ${step.outputs.join(', ')}\n- **Tools:** ${step.recommendedTools.join(', ')}\n`
      ),
      `---`,
      ``,
      `## 7. Citations`,
      ``,
      ...citations.map((c, i) => `${i + 1}. ${c.authors} (${c.year ?? 'Year not reported'}). *${c.paperTitle}*. ${c.format} - ${c.rawCitation}`),
      ``,
      `---`,
      ``,
      `## 8. Reviewer Feedback`,
      ``,
      ...reviewerFeedback.map(fb =>
        `### ${fb.category} — ${fb.severity.toUpperCase()}\n**${fb.title}**\n${fb.detail}\n> Suggestion: ${fb.actionableSuggestion}\n`
      ),
      `---`,
      ``,
      `## Student Notes`,
      ``,
      studentNotes || '_No notes provided._',
      ``,
      `---`,
      `*Exported by ResearchFlow AI — Autonomous Research Synthesis Platform*`,
    ];

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ResearchFlow_Plan_${plan.projectId}_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading synthesized research plan...
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="space-y-4 p-8 text-center">
        <div role="alert" className="text-sm text-rose-300">{error}</div>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/history')}>
            Back to Research History
          </Button>
          <Button variant="primary" onClick={() => navigate('/research')}>
            Start Research
          </Button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-4 p-8 text-center">
        <p className="text-slate-300">No research workflow has been run yet.</p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/history')}>
            View History
          </Button>
          <Button variant="primary" onClick={() => navigate('/research')}>
            Start Research
          </Button>
        </div>
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
      {workflowIdParam && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/history')}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Research History
          </Button>
        </div>
      )}

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
              {workflowIdParam && (
                <Badge variant="blue" size="sm">Historical Record</Badge>
              )}
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
            <Button
              variant="primary"
              size="sm"
              onClick={downloadFullPlanPDF}
              icon={<FileDown className="w-4 h-4" />}
            >
              Download Full Research Plan (PDF)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={exportPlanMarkdown}
              icon={<Download className="w-4 h-4" />}
            >
              Export Markdown (.md)
            </Button>
          </div>
        </div>

        {error && <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">{error}</div>}
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
          <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="research-deadline">
            Academic project deadline
          </label>
          <input
            id="research-deadline"
            type="date"
            value={deadline}
            min={new Date().toISOString().slice(0, 10)}
            onChange={event => setDeadline(event.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
          />
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
            disabled={!deadline || papers.length === 0}
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
            {papers.length} source{papers.length === 1 ? '' : 's'} returned by the current workflow.
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
            {papers.length === 0 && <p className="text-xs text-slate-400">No paper records are available.</p>}
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
            {papers.length === 0 && <p className="text-xs text-slate-400">No paper analysis is available.</p>}
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
                {comparisons.length === 0 && <tr><td colSpan={5} className="p-4 text-slate-400">No comparison results are available.</td></tr>}
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
                  <Badge variant="rose">{g.gapType ?? 'Evidence gap'}</Badge>
                </div>
                <h4 className="font-semibold text-white">{g.title}</h4>
                <p className="text-slate-300 leading-relaxed">{g.description}</p>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                  Sources: {g.sourcePaperTitles.join(', ')}
                </div>
              </div>
            ))}
            {gaps.length === 0 && <p className="text-xs text-slate-400">No evidence-based gaps are available.</p>}
          </div>
        </Card>

        {/* Section 5: Candidate Ideas */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> 5. Candidate Hypotheses & Approaches
            </h3>
            <Badge variant="amber">Candidate ideas for review</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ideas.map(idea => (
              <div key={idea.id} className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <Badge variant="emerald">{idea.status ?? 'Candidate'}</Badge>
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
            {ideas.length === 0 && <p className="text-xs text-slate-400">No candidate ideas are available.</p>}
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
            {methodology.length === 0 && <p className="text-xs text-slate-400">No methodology steps are available.</p>}
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
            {citations.length === 0 && <p className="text-xs text-slate-400">No formatted citations are available.</p>}
          </div>
        </Card>

        {/* Section 8: Deterministic Reviewer Checks */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> 8. Deterministic Reviewer Checks
            </h3>
            <Badge variant={reviewerFeedback.some(item => item.severity === 'high') ? 'amber' : 'emerald'}>
              {reviewerFeedback.length} checks
            </Badge>
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
            {reviewerFeedback.length === 0 && <p className="text-xs text-slate-400">No reviewer checks are available.</p>}
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
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadFullPlanPDF}
            icon={<FileDown className="w-4 h-4 text-blue-400" />}
          >
            Download Full Plan (PDF)
          </Button>
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
