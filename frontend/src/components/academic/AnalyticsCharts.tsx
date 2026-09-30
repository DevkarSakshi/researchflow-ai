import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import type { AcademicAnalytics } from '../../types';

interface Props {
  analytics: AcademicAnalytics | null;
}

export const AnalyticsCharts: React.FC<Props> = ({ analytics }) => {
  if (!analytics || analytics.total_tasks === 0) {
    return <p className="text-sm text-slate-400">No academic workflow data is available yet.</p>;
  }

  const statusColors: Record<string, 'blue' | 'emerald' | 'amber'> = {
    completed: 'emerald',
    in_progress: 'blue',
    pending: 'amber',
    blocked: 'amber',
  };
  const priorities = ['high', 'medium', 'low'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Task Completion</div>
            <div className="text-xl font-bold text-white mt-0.5">{analytics.completion_rate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{analytics.completed_tasks} of {analytics.total_tasks} tasks</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Overdue Tasks</div>
            <div className="text-xl font-bold text-white mt-0.5">{analytics.overdue_tasks}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{analytics.overdue_rate}% of all tasks</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Scheduled Duration</div>
            <div className="text-xl font-bold text-white mt-0.5">{analytics.total_project_days} days</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Status: {analytics.project_status.replaceAll('_', ' ')}</div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Tasks by Status and Priority
        </h4>
        <div className="space-y-3">
          {Object.entries(analytics.tasks_by_status).map(([status, count]) => (
            <div key={status}>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>{status.replaceAll('_', ' ')}</span>
                <span>{count} · {Math.round(count / analytics.total_tasks * 100)}%</span>
              </div>
              <ProgressBar progress={count / analytics.total_tasks * 100} color={statusColors[status] ?? 'blue'} />
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800 text-xs text-slate-400">
            {priorities.map(priority => (
              <span key={priority}>{priority}: {analytics.tasks_by_priority[priority] ?? 0}</span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
