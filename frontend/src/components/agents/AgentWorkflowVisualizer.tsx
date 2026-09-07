import React from 'react';
import { ArrowRight, CheckCircle2, CircleDashed, AlertCircle, Bot } from 'lucide-react';
import type { ResearchAgent } from '../../types';

interface WorkflowProps {
  agents: ResearchAgent[];
  onSelectAgent?: (agent: ResearchAgent) => void;
  selectedAgentId?: string;
}

export const AgentWorkflowVisualizer: React.FC<WorkflowProps> = ({ 
  agents, 
  onSelectAgent,
  selectedAgentId 
}) => {
  return (
    <div className="w-full overflow-x-auto py-3">
      <div className="flex items-center min-w-max space-x-2">
        {agents.map((agent, index) => {
          const isSelected = selectedAgentId === agent.id;
          const isCompleted = agent.status === 'completed';
          const isRunning = agent.status === 'running';
          const isFailed = agent.status === 'failed';

          return (
            <React.Fragment key={agent.id}>
              <div 
                onClick={() => onSelectAgent?.(agent)}
                className={`cursor-pointer group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50' 
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  isCompleted ? 'bg-emerald-500/10 text-emerald-400' :
                  isRunning ? 'bg-blue-500/10 text-blue-400 animate-spin' :
                  isFailed ? 'bg-rose-500/10 text-rose-400' :
                  'bg-slate-800 text-slate-500'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {isRunning && <CircleDashed className="w-4 h-4" />}
                  {isFailed && <AlertCircle className="w-4 h-4" />}
                  {agent.status === 'pending' && <Bot className="w-4 h-4" />}
                </div>

                <div className="text-left">
                  <div className="text-xs font-mono text-slate-400">Step {agent.order}</div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate max-w-[130px]">
                    {agent.name.replace(' Agent', '')}
                  </div>
                </div>
              </div>

              {index < agents.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
