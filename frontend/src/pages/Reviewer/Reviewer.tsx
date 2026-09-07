import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { ReviewerFeedbackItem } from '../../types';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Reviewer: React.FC = () => {
  const [feedback, setFeedback] = useState<ReviewerFeedbackItem[]>([]);

  useEffect(() => {
    agentService.getReviewerFeedback().then((data: ReviewerFeedbackItem[]) => setFeedback(data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
        <div>
          <Badge variant="emerald">Simulated Peer Review Verdict</Badge>
          <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" /> Score: 8.8 / 10.0 (Strong Accept)
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Audited by the Reviewer Agent for methodological rigor, empirical consistency, and dataset compatibility.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {feedback.map((item, idx) => (
          <Card key={idx} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={item.severity === 'high' ? 'rose' : item.severity === 'medium' ? 'amber' : 'blue'}>
                  {item.category} • {item.severity.toUpperCase()} SEVERITY
                </Badge>
                <h4 className="font-semibold text-slate-100 text-sm">{item.title}</h4>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.detail}
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-emerald-300">
              <strong className="text-white">Reviewer Suggestion:</strong> {item.actionableSuggestion}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
