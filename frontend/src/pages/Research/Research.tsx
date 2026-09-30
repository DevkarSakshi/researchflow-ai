import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Play,
  ShieldCheck,
  RefreshCw,
  FileText,
  Upload,
  FileUp,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { AgentWorkflowVisualizer } from '../../components/agents/AgentWorkflowVisualizer';
import { AgentStatusCard } from '../../components/agents/AgentStatusCard';
import { ApprovalModal } from '../../components/agents/ApprovalModal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Research: React.FC = () => {
  const navigate = useNavigate();
  const { agents, finalPlan, workflowResult, error, isRunning, loading, runWorkflow, approvePlan } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [query, setQuery] = useState('');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedPapers, setUploadedPapers] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const newItems: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const hasPDFExtension = file.name.toLowerCase().endsWith('.pdf');
      if (!hasPDFExtension || (file.type && file.type !== 'application/pdf')) {
        setUploadError(`${file.name} is not a PDF file.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`${file.name} exceeds the 10 MiB per-file limit.`);
        continue;
      }
      if (file.size > 0) {
        newItems.push(file);
      }
    }
    if (newItems.length > 0) {
      const combined = [...uploadedPapers, ...newItems];
      const totalSize = combined.reduce((total, file) => total + file.size, 0);
      if (totalSize > 20 * 1024 * 1024) {
        setUploadError('Combined PDF uploads exceed the 20 MiB limit.');
      } else {
        setUploadedPapers(combined);
      }
    }
  }

  function removePaper(fileToRemove: File) {
    setUploadedPapers(prev => prev.filter(file => file !== fileToRemove));
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bot className="w-6 h-6 text-blue-400" /> Research Workspace
            </h1>
            <Badge variant="blue">Autonomous Engine</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload research paper PDFs or state a research topic to run the synthesis workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/final-plan')}
            icon={<FileText className="w-4 h-4 text-emerald-400" />}
          >
            Final Research Plan
          </Button>
        </div>
      </div>

      {/* Input Section: Dual Input (PDF Upload Zone + Topic Input) */}
      <Card className="space-y-5">
        {/* Step 1: Research Paper PDF Upload Dropzone */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase font-mono flex items-center gap-1.5">
              <FileUp className="w-4 h-4 text-blue-400" /> Step 1: Upload Research Paper PDFs
            </label>
            <span className="text-[11px] text-slate-400 font-mono">Specialized for academic PDFs (.pdf)</span>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-900/60'
              }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                handleFileSelect(e.target.files);
                e.target.value = '';
              }}
              accept=".pdf"
              multiple
              className="hidden"
            />
            <div className="max-w-md mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-white">
                Drag & Drop research paper PDFs here, or <span className="text-blue-400 underline underline-offset-2">Browse Files</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Supports conference & journal PDFs (NeurIPS, ICML, IEEE, arXiv, PubMed, etc.)
              </p>
            </div>
          </div>

          {uploadError && <p role="alert" className="mt-2 text-xs text-rose-300">{uploadError}</p>}

          {/* Active Uploaded Papers Chips */}
          {uploadedPapers.length > 0 && (
            <div className="mt-3 space-y-1.5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>Queued Papers for Agent Extraction ({uploadedPapers.length}):</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for Paper Intelligence Agent
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadedPapers.map((paper, index) => (
                  <div
                    key={`${paper.name}-${paper.lastModified}-${index}`}
                    className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="font-mono text-[11px] truncate max-w-[240px]">{paper.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({(paper.size / (1024 * 1024)).toFixed(1)} MB)</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePaper(paper); }}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer ml-1"
                      title="Remove paper"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Research Problem / Topic Query */}
        <div className="pt-3 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Step 2: Research Problem / Focus Topic
          </label>
          <div className="flex flex-col md:flex-row gap-3 items-center">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 transition font-sans"
              placeholder="State your hypothesis or academic research problem..."
            />
            <div className="flex gap-2 w-full md:w-auto self-end shrink-0">
              <Button
                variant="primary"
                onClick={() => runWorkflow(query, uploadedPapers)}
                disabled={isRunning || (!query.trim() && uploadedPapers.length === 0)}
                icon={isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              >
                {isRunning ? 'Running Research Workflow...' : 'Start Research Workflow'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsApprovalOpen(true)}
                disabled={!finalPlan || isRunning}
                icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
              >
                Approve Plan
              </Button>
            </div>
          </div>
        </div>

        {/* 9-Agent Sequential Workflow DAG Visualizer */}
        <div className="pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-mono text-slate-400">
              Workflow Pipeline: Orchestrator → Literature → Paper Intelligence → Comparison → Gap → Idea → Methodology → Citation → Reviewer → Final Plan
            </div>
            <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
              Stages: Pending → Running → Completed
            </div>
          </div>
          <AgentWorkflowVisualizer
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgent={a => setSelectedAgentId(a.id)}
          />
        </div>
      </Card>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {workflowResult && (
        <Card className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Workflow Results</h2>
            <p className="mt-1 text-xs text-slate-400">
              {workflowResult.research_problem || 'PDF-based research'}
              {workflowResult.pdfs.length > 0 && ` · ${workflowResult.pdfs.length} PDF${workflowResult.pdfs.length === 1 ? '' : 's'}`}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {([
              ['Literature', workflowResult.papers],
              ['PDF Analysis', workflowResult.paper_analysis],
              ['Comparison', workflowResult.comparison],
              ['Research Gaps', workflowResult.research_gaps],
              ['Research Ideas', workflowResult.research_ideas],
              ['Methodology', workflowResult.methodology],
              ['Citations', workflowResult.citations],
              ['Reviewer Feedback', workflowResult.reviewer_feedback],
              ['Final Research Plan', workflowResult.final_research_plan]
            ] as const).map(([title, output]) => (
              <section key={title} className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <h3 className="mb-2 text-xs font-semibold uppercase text-slate-300">{title}</h3>
                <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words text-[11px] text-slate-400">
                  {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
                </pre>
              </section>
            ))}
          </div>
        </Card>
      )}

      {!loading && !workflowResult && !isRunning && !error && (
        <p className="text-sm text-slate-400">No research workflow has been run yet.</p>
      )}

      {/* 9 Agents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" /> Research Pipeline Stages ({agents.filter(agent => agent.status === 'completed').length}/{agents.length} completed)
          </h3>
          <span className="text-xs text-slate-400">Click any agent to inspect runtime logs and telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <AgentStatusCard
              key={agent.id}
              agent={agent}
              onInspect={() => setSelectedAgentId(agent.id)}
            />
          ))}
        </div>
      </div>

      {/* Human Student Approval Modal */}
      <ApprovalModal
        isOpen={isApprovalOpen}
        onClose={() => setIsApprovalOpen(false)}
        plan={finalPlan}
        canApprove={Boolean(workflowResult?.paper_analysis.length)}
        onApprove={approvePlan}
      />
    </div>
  );
};
