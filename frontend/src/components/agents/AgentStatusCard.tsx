import React from 'react';
import { Bot, Clock, Cpu, Terminal } from 'lucide-react';
import type { ResearchAgent } from '../../types';
import { Badge } from '../common/Badge';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

interface Props {
  agent: ResearchAgent;
  onInspect?: () => void;
}

export const AgentStatusCard: React.FC<Props> = ({ agent, onInspect }) => {
  const statusBadge = {
    completed: <Badge variant="emerald">Completed</Badge>,
    running: <Badge variant="blue" pulse>Processing</Badge>,
    pending: <Badge variant="slate">Queued</Badge>,
    failed: <Badge variant="rose">Failed</Badge>
  }[agent.status];

  return (
    <Card hoverEffect className="relative overflow-hidden flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100 text-sm leading-tight">{agent.name}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{agent.role}</p>
            </div>
          </div>
          {statusBadge}
        </div>

        <div className="my-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Execution Progress</span>
            <span>{agent.progress}%</span>
          </div>
          <ProgressBar progress={agent.progress} color={agent.status === 'completed' ? 'emerald' : 'blue'} />
        </div>

        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 my-3 text-xs font-mono text-slate-300 line-clamp-3">
          {agent.summaryOutput || 'Waiting for upstream orchestrator dispatch...'}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          {agent.metrics && (
            <>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {agent.metrics.durationSec}s</span>
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> {agent.metrics.tokensUsed.toLocaleString()} tokens</span>
            </>
          )}
        </div>
        <button 
          onClick={onInspect}
          className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5" /> Logs
        </button>
      </div>
    </Card>
  );
};
