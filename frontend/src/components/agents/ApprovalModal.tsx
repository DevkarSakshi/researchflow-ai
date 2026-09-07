import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, FileText } from 'lucide-react';
import type { FinalResearchPlan } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: FinalResearchPlan | null;
  onApprove: (decision: 'approved' | 'rejected' | 'changes_requested', notes?: string) => Promise<void>;
}

export const ApprovalModal: React.FC<Props> = ({ isOpen, onClose, plan, onApprove }) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!plan) return null;

  async function handleAction(decision: 'approved' | 'rejected' | 'changes_requested') {
    setSubmitting(true);
    try {
      await onApprove(decision, notes);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Student Approval Gate: Synthesized Research Plan" maxWidth="3xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
          <div>
            <div className="text-xs font-mono text-blue-400">PROJECT ID: {plan.projectId}</div>
            <h4 className="font-bold text-white text-base mt-0.5">{plan.topic}</h4>
            <div className="text-xs text-slate-400 mt-1">Generated: {plan.generatedDate}</div>
          </div>
          <Badge variant={plan.humanApprovalStatus === 'approved' ? 'emerald' : 'amber'} pulse>
            {plan.humanApprovalStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Executive Research Problem & Novel Hypothesis
          </h5>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-sm space-y-2">
            <p className="text-slate-300"><strong className="text-white">Problem:</strong> {plan.problemStatement}</p>
            <p className="text-slate-300"><strong className="text-blue-400">Novel Hypothesis:</strong> {plan.novelHypothesis}</p>
            <p className="text-slate-300"><strong className="text-slate-400">Methodology:</strong> {plan.methodologySummary}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h6 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Target Benchmark Datasets</h6>
            <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
              {plan.datasets.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
            <h6 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Anticipated Risks & Guardrails</h6>
            <div className="space-y-1.5 text-xs">
              {plan.risksAndMitigations.map((rm, i) => (
                <div key={i} className="text-slate-300">
                  <span className="text-rose-400 font-medium">⚠️ {rm.risk}:</span> {rm.mitigation}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Student Feedback / Revisions Required for Downstream Agents
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g., Ensure the speculative routing threshold is logged per benchmark query, or request higher weight on PubMedQA..."
            className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="danger" size="sm" onClick={() => handleAction('rejected')} disabled={submitting} icon={<XCircle className="w-4 h-4" />}>
            Reject Plan
          </Button>
          <Button variant="secondary" size="sm" onClick={() => handleAction('changes_requested')} disabled={submitting} icon={<AlertCircle className="w-4 h-4" />}>
            Request Changes
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleAction('approved')} disabled={submitting} icon={<CheckCircle2 className="w-4 h-4" />}>
            Authorize & Execute Proposal
          </Button>
        </div>
      </div>
    </Modal>
  );
};
