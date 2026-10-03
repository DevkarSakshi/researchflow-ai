import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  FileCheck,
  Calendar,
  Layers,
  RefreshCw,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { agentService } from '../../services/agentService';
import type { ResearchHistoryItem } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ResearchHistory: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<ResearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  async function loadHistory() {
    setLoading(true);
    setError(null);
    try {
      const response = await agentService.getResearchHistory();
      setHistory(response.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load research history.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const problem = (item.research_problem || '').toLowerCase();
    const status = (item.status || '').toLowerCase();
    const approval = (item.approval_status || '').toLowerCase();
    return problem.includes(term) || status.includes(term) || approval.includes(term);
  });

  function renderStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="emerald" size="sm">Completed</Badge>;
      case 'started':
      case 'running':
        return <Badge variant="blue" size="sm" pulse>In Progress</Badge>;
      case 'failed':
        return <Badge variant="rose" size="sm">Failed</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  }

  function renderApprovalBadge(approval: string) {
    switch (approval.toLowerCase()) {
      case 'approved':
        return <Badge variant="emerald" size="sm">Approved</Badge>;
      case 'changes_requested':
        return <Badge variant="blue" size="sm">Changes Requested</Badge>;
      case 'rejected':
        return <Badge variant="rose" size="sm">Rejected</Badge>;
      case 'pending':
      case 'pending_review':
        return <Badge variant="amber" size="sm">Pending Review</Badge>;
      default:
        return <Badge variant="slate" size="sm">{approval}</Badge>;
    }
  }

  function formatDate(isoString?: string | null) {
    if (!isoString) return 'Date not recorded';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <History className="w-6 h-6 text-blue-400" /> Research History
            </h1>
            <Badge variant="blue">Reuse & Archive</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access, view, and reuse all previously generated research plans and investigations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadHistory}
            disabled={loading}
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/research')}
            icon={<Layers className="w-4 h-4" />}
          >
            New Research
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search research history by topic, status, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <Card className="border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>{error}</div>
        </Card>
      )}

      {/* Loading state */}
      {loading && history.length === 0 && (
        <Card className="p-12 text-center text-slate-400">
          <div className="inline-block animate-spin mb-3">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm">Loading your previous research investigations...</p>
        </Card>
      )}

      {/* Empty State */}
      {!loading && history.length === 0 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">No research history yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't initiated any research workflows yet. Start a new workflow by entering a topic or uploading research papers.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="primary"
              onClick={() => navigate('/research')}
              icon={<Layers className="w-4 h-4" />}
            >
              Start Your First Research
            </Button>
          </div>
        </Card>
      )}

      {/* Filtered Empty State */}
      {!loading && history.length > 0 && filteredHistory.length === 0 && (
        <Card className="p-8 text-center text-slate-400 space-y-2">
          <p className="text-sm">No research entries matched "{searchTerm}".</p>
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            Clear search filter
          </Button>
        </Card>
      )}

      {/* History Items List */}
      {!loading && filteredHistory.length > 0 && (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const hasProblem = Boolean(item.research_problem && item.research_problem.trim());
            const displayTitle = hasProblem
              ? item.research_problem
              : `Research Project (${item.paper_count} uploaded paper${item.paper_count === 1 ? '' : 's'})`;

            return (
              <Card
                key={item.id}
                className="hover:border-blue-500/40 transition-colors p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      ID: {item.id.slice(-8)}
                    </span>
                    {renderStatusBadge(item.status)}
                    {renderApprovalBadge(item.approval_status)}
                    {item.has_final_plan && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Plan Ready
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {displayTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(item.created_at)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      {item.paper_count} paper{item.paper_count === 1 ? '' : 's'} analyzed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/final-plan?id=${encodeURIComponent(item.id)}`)}
                    icon={<FileCheck className="w-4 h-4 text-white" />}
                  >
                    View Research Plan
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
