import React, { useState } from 'react';
import { Bot, Play, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAgents } from '../../hooks/useAgents';
import { AgentWorkflowVisualizer } from '../../components/agents/AgentWorkflowVisualizer';
import { AgentStatusCard } from '../../components/agents/AgentStatusCard';
import { ApprovalModal } from '../../components/agents/ApprovalModal';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const Research: React.FC = () => {
  const { agents, finalPlan, isRunning, runWorkflowSimulation, approvePlan } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>('orchestrator');
  const [query, setQuery] = useState('How can speculative decoding accelerate multi-agent verification loops in academic synthesis?');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Top Query Execution Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase font-mono">
              Research Problem Query
            </label>
            <input 
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-blue-500 transition"
              placeholder="State your hypothesis or academic query..."
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto self-end">
            <Button 
              variant="primary" 
              onClick={() => runWorkflowSimulation(query)} 
              disabled={isRunning}
              icon={isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            >
              {isRunning ? 'Running 9 Agents...' : 'Run Autonomous Workflow'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => setIsApprovalOpen(true)}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
            >
              Review Plan
            </Button>
          </div>
        </div>

        {/* 9-Agent Sequential Workflow DAG Visualizer */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400 mb-1">Workflow Pipeline (Orchestrator → Reviewer → Approval)</div>
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
          <span className="text-xs text-slate-400">Click any agent to inspect runtime logs</span>
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
