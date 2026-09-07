import React, { useEffect, useState } from 'react';
import { Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import type { ResearchGap as ResearchGapType, SuggestedIdea } from '../../types';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const ResearchGap: React.FC = () => {
  const [gaps, setGaps] = useState<ResearchGapType[]>([]);
  const [ideas, setIdeas] = useState<SuggestedIdea[]>([]);

  useEffect(() => {
    agentService.getGapsAndIdeas().then((data: { gaps: ResearchGapType[]; ideas: SuggestedIdea[] }) => {
      setGaps(data.gaps);
      setIdeas(data.ideas);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" /> Identified Research Gaps & Novel Ideas
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Uncovered by the Gap Agent and formulated into actionable research hypotheses by the Idea Agent.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" /> Literature Blindspots & Empirical Gaps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gaps.map(gap => (
            <Card key={gap.id} hoverEffect className="flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="rose">Impact: {gap.impactScore}/10</Badge>
                  <span className="text-[11px] font-mono text-slate-400">Feasibility: {gap.feasibilityScore}/10</span>
                </div>
                <h4 className="font-semibold text-slate-100 text-sm">{gap.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{gap.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="font-medium text-slate-300">Evidenced in: </span>
                {gap.sourcePaperTitles.join(', ')}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" /> Formulated Novel Hypotheses & System Architectures
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ideas.map(idea => (
            <Card key={idea.id} hoverEffect className="space-y-3 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/30">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">Effort: ~{idea.estimatedEffortWeeks} Weeks</Badge>
                <span className="text-xs font-mono text-blue-400 flex items-center gap-1">
                  Target: {idea.targetGapId} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>

              <h4 className="font-bold text-white text-base">{idea.title}</h4>
              <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-lg border border-slate-800 leading-relaxed">
                <strong className="text-blue-400">Core Hypothesis:</strong> {idea.coreHypothesis}
              </p>

              <div className="text-xs text-slate-400 space-y-1">
                <div><strong className="text-slate-300">Rationale:</strong> {idea.rationale}</div>
                <div><strong className="text-slate-300">Architecture:</strong> {idea.recommendedArchitecture}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
