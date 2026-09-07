import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

export const AnalyticsCharts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Weekly Research Velocity</div>
            <div className="text-xl font-bold text-white mt-0.5">+28.4%</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Exceeding sprint target</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Milestone Accuracy</div>
            <div className="text-xl font-bold text-white mt-0.5">91.4%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">14 of 16 completed on time</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Literature Reading Hours</div>
            <div className="text-xl font-bold text-white mt-0.5">34.5 hrs</div>
            <div className="text-[11px] text-purple-400 mt-0.5">Recorded across 14 papers</div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" /> Research Workload Distribution by Component
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Literature & Empirical Extraction</span>
              <span>45%</span>
            </div>
            <ProgressBar progress={45} color="blue" />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Methodology Formalization & Math</span>
              <span>30%</span>
            </div>
            <ProgressBar progress={30} color="emerald" />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Adversarial Reviewer Rebuttals</span>
              <span>15%</span>
            </div>
            <ProgressBar progress={15} color="amber" />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Thesis Chapter Writing</span>
              <span>10%</span>
            </div>
            <ProgressBar progress={10} color="blue" />
          </div>
        </div>
      </Card>
    </div>
  );
};
