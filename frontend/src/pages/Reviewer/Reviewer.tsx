import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import type { ReviewerFeedbackItem } from '../../types';
import { agentService } from '../../services/agentService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Reviewer: React.FC = () => {
  const [feedback, setFeedback] = useState<ReviewerFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    agentService.getReviewerFeedback()
      .then(setFeedback)
      .catch(loadError => setError(loadError instanceof Error ? loadError.message : 'Could not load reviewer checks.'))
      .finally(() => setLoading(false));
  }, []);

  const passedCount = feedback.filter(item => item.severity === 'low').length;
  const hasConcerns = feedback.some(item => item.severity !== 'low');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950/40 p-6 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
        <div>
          <Badge variant={hasConcerns ? 'amber' : 'emerald'}>Deterministic Research Checks</Badge>
          <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            {feedback.length ? `${passedCount} of ${feedback.length} checks passed` : 'No review available'}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Audited by the Reviewer Agent for methodological rigor, empirical consistency, and dataset compatibility.
          </p>
        </div>
      </div>

      {error && <div role="alert" className="text-sm text-rose-300">{error}</div>}
      {loading && <p className="text-sm text-slate-400">Loading reviewer checks...</p>}
      {!loading && !error && feedback.length === 0 && <p className="text-sm text-slate-400">No research workflow has been run yet.</p>}

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
