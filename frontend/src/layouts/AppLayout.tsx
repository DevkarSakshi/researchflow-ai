import React, { useState } from 'react';
import { NavLink, Outlet, redirect, useLoaderData, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  FileCheck,
  BookOpen,
  GitCompare,
  Sparkles,
  Compass,
  Quote,
  ShieldCheck,
  GraduationCap,
  User,
  Search,
  Bell,
  Cpu,
  Settings,
  LogOut,
  Sun,
  Moon,
  Laptop,
  History
} from 'lucide-react';

import { API_BASE_URL, request } from '../services/api';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useTheme, type Theme } from '../context/ThemeContext';
import type { AcademicDeadline } from '../types';

export interface AppData {
  user: { name: string; email: string; researchflow_id: string };
  workflow: {
    status: string;
    research_problem: string;
    agents: string[];
    agent_statuses?: Record<string, string> | null;
    result?: {
      papers?: unknown[];
      paper_analysis?: unknown[];
      comparison?: unknown[];
      research_gaps?: unknown[];
      research_ideas?: unknown[];
      methodology?: unknown;
      citations?: unknown[];
      reviewer_feedback?: string;
      final_research_plan?: unknown;
    };
  } | null;
  academicState: {
    project: unknown;
    reminders: unknown[];
    progress: { progress_percentage: number };
    tasks: unknown[];
  };
  deadlines: AcademicDeadline[];
}

export async function loadAppData(): Promise<AppData | Response> {
  const token = localStorage.getItem('researchflow_token');
  if (!token) return redirect('/login');

  const [user, workflow, academicState, deadlines] = await Promise.all([
    request<{ user: AppData['user'] }>('/auth/me').then(result => result.user).catch(() => null),
    request<{ workflow: AppData['workflow'] }>('/research/latest').then(result => result.workflow).catch(() => null),
    request<AppData['academicState']>('/academic/state').catch(() => null),
    request<AcademicDeadline[]>('/academic/deadlines').catch(() => []),
  ]);

  return {
    user: user ?? {
      name: localStorage.getItem('researchflow_name') || 'Researcher',
      email: '',
      researchflow_id: localStorage.getItem('researchflow_id') || '',
    },
    workflow,
    academicState: academicState ?? {
      project: null,
      reminders: [],
      progress: { progress_percentage: 0 },
      tasks: [],
    },
    deadlines,
  };
}

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const data = useLoaderData() as AppData;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  const statuses = Object.values(data.workflow?.agent_statuses ?? {});
  const researchAgentCount = statuses.length;
  const completedResearchAgents = statuses.filter(status => status === 'completed').length;
  const hasAcademicProject = data.academicState.project !== null;
  const reminderCount = data.academicState.reminders.length;
  const backendStatus = researchAgentCount ? 'Research workflow loaded' : 'Research workflow not started';

  const navItems = [
    { to: '/dashboard', label: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/workspace', label: 'Research Workspace', icon: <Bot className="w-4 h-4 text-blue-400" /> },
    { to: '/history', label: 'Research History', icon: <History className="w-4 h-4 text-amber-400" /> },
    { to: '/final-plan', label: 'Final Research Plan', icon: <FileCheck className="w-4 h-4 text-emerald-400" /> },
    { to: '/papers', label: 'Paper Intelligence', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/comparison', label: 'Comparison Matrix', icon: <GitCompare className="w-4 h-4" /> },
    { to: '/gaps', label: 'Gaps & Ideas', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/methodology', label: 'Methodology Plan', icon: <Compass className="w-4 h-4" /> },
    { to: '/citations', label: 'Citations & BibTeX', icon: <Quote className="w-4 h-4" /> },
    { to: '/reviewer', label: 'AI Reviewer Report', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/academic', label: 'Academic Workflow (4)', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/profile', label: 'Student Profile', icon: <User className="w-4 h-4" /> },
  ];


  function handleLogout() {
    if (confirm('Are you sure you want to log out of your ResearchFlow workspace?')) {
      localStorage.removeItem('researchflow_token');
      localStorage.removeItem('researchflow_id');
      localStorage.removeItem('researchflow_name');

      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-white flex items-center gap-1.5 text-base">
              ResearchFlow <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">AI</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Academic OS v2.4</div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Workspace & Agents
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* System & Session Group */}
          <div className="pt-3 mt-2 border-t border-slate-800/80">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              System
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition cursor-pointer text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              Settings
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </nav>

        {/* Profile preview at bottom of sidebar */}
        <div
          onClick={() => navigate('/profile')}
          className="p-4 border-t border-slate-800/80 flex items-center gap-3 hover:bg-slate-900 cursor-pointer transition"
        >
          <div className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">{data.user.name}</div>
            <div className="text-[10px] text-blue-400 font-mono truncate">{data.user.researchflow_id}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 w-72">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search research problem, papers, gaps..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${researchAgentCount ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
              {researchAgentCount ? `${completedResearchAgents}/${researchAgentCount} research stages complete` : backendStatus}
              <span>· Academic {hasAcademicProject ? 'active' : 'pending approval'}</span>
            </div>

            <button
              onClick={() => navigate('/academic')}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition relative cursor-pointer"
              title="View task reminders"
            >
              <Bell className="w-4 h-4" />
              {reminderCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet context={data} />
        </main>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="ResearchFlow AI Settings"
        maxWidth="lg"
      >
        <div className="space-y-5 text-xs text-slate-300">
          {/* Appearance / Theme Selector */}
          <div>
            <label className="block text-slate-300 mb-2 font-medium">Appearance & Theme</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, desc: 'Default dark workspace' },
                  { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, desc: 'Clean bright layout' },
                  { id: 'system', label: 'System', icon: <Laptop className="w-4 h-4" />, desc: 'Match OS preference' },
                ] as const
              ).map((option) => {
                const isActive = theme === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setTheme(option.id as Theme)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-semibold shadow-sm shadow-blue-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="mb-1.5">{option.icon}</div>
                    <span className="text-xs">{option.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{option.desc}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              Active mode: <span className="text-blue-400 capitalize">{theme}</span> {theme === 'system' && `(currently ${resolvedTheme})`}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-slate-300 mb-1 font-medium">FastAPI Connection</label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">{API_BASE_URL}</div>
            <p className="mt-3 text-xs text-slate-400">Paper extraction, citations, comparisons, and academic calculations run locally. No LLM is required for the current workflow.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
