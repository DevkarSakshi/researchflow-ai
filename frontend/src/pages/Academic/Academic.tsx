import React, { useState } from 'react';
import { GraduationCap, Calendar, Clock, BarChart3, CheckSquare } from 'lucide-react';
import { useAcademic } from '../../hooks/useAcademic';
import { TaskPlannerView } from '../../components/academic/TaskPlannerView';
import { AnalyticsCharts } from '../../components/academic/AnalyticsCharts';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const Academic: React.FC = () => {
  const { tasks, deadlines, agents, toggleTask, addTask } = useAcademic();
  const [activeTab, setActiveTab] = useState<'planner' | 'reminders' | 'analytics' | 'tracker'>('planner');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-400" /> Academic Workflow Orchestration (4 Agents)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Planner, Reminder, Analytics, and Progress Tracker agents synchronizing your graduate academic timeline.
        </p>
      </div>

      {/* 4 Academic Agent Snapshot Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map(ag => (
          <div key={ag.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-200">{ag.name}</span>
              <Badge variant="blue">Active</Badge>
            </div>
            <div className="text-[11px] text-slate-400">{ag.insights[0]}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-medium">
        <button 
          onClick={() => setActiveTab('planner')} 
          className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${activeTab === 'planner' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <CheckSquare className="w-4 h-4" /> Planner Agent
        </button>
        <button 
          onClick={() => setActiveTab('reminders')} 
          className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${activeTab === 'reminders' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Clock className="w-4 h-4" /> Reminders Agent
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${activeTab === 'analytics' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics Agent
        </button>
        <button 
          onClick={() => setActiveTab('tracker')} 
          className={`pb-3 flex items-center gap-1.5 transition cursor-pointer ${activeTab === 'tracker' ? 'text-blue-400 border-b-2 border-blue-500 font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Calendar className="w-4 h-4" /> Progress Tracker
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'planner' && (
        <TaskPlannerView tasks={tasks} onToggle={toggleTask} onAdd={addTask} />
      )}

      {activeTab === 'reminders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deadlines.map(d => (
            <Card key={d.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={d.urgent ? 'rose' : 'blue'}>{d.daysRemaining} Days Left</Badge>
                <span className="text-xs font-mono text-slate-400">{d.course}</span>
              </div>
              <h4 className="font-bold text-white text-sm">{d.title}</h4>
              <p className="text-xs text-slate-300">Scheduled Due Date: {d.dueDate}</p>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && <AnalyticsCharts />}

      {activeTab === 'tracker' && (
        <Card className="space-y-4">
          <h4 className="font-semibold text-white text-sm">Thesis Capstone Milestone Roadmap</h4>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-200 font-medium">Stage 1: Literature Synthesis & Problem Definition</span>
              <Badge variant="emerald">100% Completed</Badge>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-200 font-medium">Stage 2: Mathematical Formalism & Empirical Setup</span>
              <Badge variant="blue" pulse>In Progress (80%)</Badge>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-200 font-medium">Stage 3: Full Benchmark Validation & Advisor Defense</span>
              <Badge variant="slate">Queued for Oct 2026</Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
