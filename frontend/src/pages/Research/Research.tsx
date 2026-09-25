import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Play, ShieldCheck, RefreshCw, FileText } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { AgentWorkflowVisualizer } from '../../components/agents/AgentWorkflowVisualizer';
import { AgentStatusCard } from '../../components/agents/AgentStatusCard';
import { ApprovalModal } from '../../components/agents/ApprovalModal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Research: React.FC = () => {
  const navigate = useNavigate();
  const { agents, finalPlan, isRunning, runWorkflowSimulation, approvePlan } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [query, setQuery] = useState('How can speculative decoding accelerate multi-agent verification loops in academic synthesis?');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

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
            Formulate your research topic and trigger the 9-agent autonomous reasoning and synthesis pipeline.
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

      {/* Top Query Execution Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Research Problem / Topic
            </label>
            <input 
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="State your hypothesis or academic research problem..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto self-end">
            <Button 
              variant="primary" 
              onClick={() => runWorkflowSimulation(query)} 
              disabled={isRunning}
              icon={isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            >
              {isRunning ? 'Running Research Workflow...' : 'Start Research Workflow'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsApprovalOpen(true)}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Approve Plan
            </Button>
          </div>
        </div>

        {/* 9-Agent Sequential Workflow DAG Visualizer */}
        <div className="pt-2 border-t border-slate-800">
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

      {/* 9 Agents Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" /> Active Research Agents (9)
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
        onApprove={approvePlan} 
      />
    </div>
  );
};
