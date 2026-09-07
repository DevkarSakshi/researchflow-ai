import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, BookOpen, Clock, Award, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { mockUser, mockAcademicDeadlines, mockResearchAgents } from '../../data/mockData';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-purple-900/40 border border-blue-500/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <Badge variant="blue">Fall 2026 Research Sprint</Badge>
            <span className="text-xs text-slate-400 font-mono">Stanford AI Lab</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Welcome back, {mockUser.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Active Project: <strong className="text-white">{mockUser.activeProjectName}</strong>. 
            All 9 research agents and 4 academic orchestrators are synchronized.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => navigate('/research')} icon={<Play className="w-4 h-4" />}>
            Trigger Agent Workflow
          </Button>
          <Button variant="secondary" onClick={() => navigate('/academic')}>
            Academic Tasks
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Research Agents</div>
            <div className="text-xl font-bold text-white mt-0.5">9 / 9 Active</div>
            <div className="text-[11px] text-emerald-400">Pipeline converged</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Extracted Papers</div>
            <div className="text-xl font-bold text-white mt-0.5">14 High-Impact</div>
            <div className="text-[11px] text-purple-400">NeurIPS, ICLR, ACL</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Urgent Deadlines</div>
            <div className="text-xl font-bold text-white mt-0.5">2 This Week</div>
            <div className="text-[11px] text-amber-400">CS 330 & Capstone</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Academic Standing</div>
            <div className="text-xl font-bold text-white mt-0.5">{mockUser.gpa}</div>
            <div className="text-[11px] text-emerald-400">Distinction Track</div>
          </div>
        </Card>
      </div>

      {/* Grid: Pipeline Status + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" /> Research Agent Pipeline Live Status
            </h3>
            <button 
              onClick={() => navigate('/research')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              Full Agent View <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {mockResearchAgents.slice(0, 5).map(agent => (
              <div key={agent.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{agent.name}</div>
                  <div className="text-[11px] text-slate-400 truncate max-w-md">{agent.summaryOutput}</div>
                </div>
                <Badge variant="emerald">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Upcoming Deadlines
            </h3>
            <button 
              onClick={() => navigate('/academic')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {mockAcademicDeadlines.map(d => (
              <div key={d.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{d.title}</span>
                  <Badge variant={d.urgent ? 'rose' : 'slate'}>{d.daysRemaining}d left</Badge>
                </div>
                <div className="text-[11px] text-slate-400">{d.course} • {d.dueDate}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
