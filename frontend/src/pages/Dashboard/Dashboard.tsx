import React from 'react';

import { useNavigate, useOutletContext } from 'react-router-dom';
import { Bot, BookOpen, Clock, Award, ArrowRight, Play } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { AppData } from '../../layouts/AppLayout';

function outputSummary(output: unknown) {
  if (Array.isArray(output)) return `${output.length} result${output.length === 1 ? '' : 's'}`;
  if (typeof output === 'string') return output;
  return JSON.stringify(output);
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, workflow, academicState, deadlines } = useOutletContext<AppData>();
  const academicProgress = academicState.progress.progress_percentage;
  const academicTaskCount = academicState.tasks.length;
  const agentStatuses = workflow?.agent_statuses ?? {};

  const researchOutputs: { id: string; name: string; output: unknown }[] = workflow?.result ? [
    { id: 'literature', name: 'Literature Agent', output: workflow.result.papers },
    { id: 'paper_intelligence', name: 'Paper Intelligence Agent', output: workflow.result.paper_analysis },
    { id: 'comparison', name: 'Comparison Agent', output: workflow.result.comparison },
    { id: 'gap', name: 'Gap Agent', output: workflow.result.research_gaps },
    { id: 'idea', name: 'Idea Agent', output: workflow.result.research_ideas },
    { id: 'methodology', name: 'Methodology Agent', output: workflow.result.methodology },
    { id: 'citation', name: 'Citation Agent', output: workflow.result.citations },
    { id: 'reviewer', name: 'Reviewer Agent', output: workflow.result.reviewer_feedback },
    { id: 'final_plan', name: 'Final Research Plan Agent', output: workflow.result.final_research_plan }
  ].filter(item => item.output !== undefined) : [];
  const analyzedPaperCount = workflow?.result?.paper_analysis?.length ?? 0;
  const completedAgentCount = Object.values(agentStatuses).filter(status => status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="blue">ResearchFlow AI</Badge>
            <span className="text-xs text-slate-400 font-mono">
              {workflow?.status ?? 'No research workflow yet'}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Active Research: <strong className="text-white">
              {workflow?.research_problem || 'No topic provided'}
            </strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/research')} icon={<Play className="w-4 h-4" />}>
            Trigger Agent Workflow
          </Button>
          <Button variant="secondary" onClick={() => navigate('/academic')}>
            Academic Tasks
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Research Agents</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {workflow ? `${completedAgentCount} / ${Object.keys(agentStatuses).length}` : 'Not started'}
            </div>
            <div className="text-[11px] text-slate-400">{workflow?.status ?? 'No workflow submitted'}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Extracted Papers</div>
            <div className="text-xl font-bold text-white mt-0.5">{analyzedPaperCount}</div>
            <div className="text-[11px] text-slate-400">Analyzed in latest workflow</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Academic Tasks</div>
            <div className="text-xl font-bold text-white mt-0.5">{academicTaskCount}</div>
            <div className="text-[11px] text-slate-400">Persisted tasks</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Academic Progress</div>
            <div className="text-xl font-bold text-white mt-0.5">{academicProgress}%</div>
            <div className="text-[11px] text-slate-400">Calculated from task status</div>
          </div>
        </Card>
      </div>

      {/* Grid: Pipeline Status + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" /> Research Agent Pipeline Live Status
            </h3>
            <button
              onClick={() => navigate('/research')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Full Agent View <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {researchOutputs.length > 0 ? researchOutputs.map(({ id, name, output }) => (
              <div key={name} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">{outputSummary(output)}</div>
                </div>
                <Badge variant={agentStatuses[id] === 'completed' ? 'emerald' : agentStatuses[id] === 'failed' ? 'rose' : 'slate'}>
                  {agentStatuses[id] ?? 'pending'}
                </Badge>
              </div>
            )) : (
              <p className="text-xs text-slate-400">No workflow results yet.</p>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Upcoming Deadlines
            </h3>
            <button
              onClick={() => navigate('/academic')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {deadlines.map(d => (
              <div key={d.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{d.title}</span>
                  <Badge variant={d.urgent ? 'rose' : 'slate'}>{d.daysRemaining}d left</Badge>
                </div>
                <div className="text-[11px] text-slate-400">{d.course} • {d.dueDate}</div>
              </div>
            ))}
            {deadlines.length === 0 && <p className="text-xs text-slate-400">No upcoming academic deadlines.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};
