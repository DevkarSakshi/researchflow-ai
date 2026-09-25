import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
  LogOut
} from 'lucide-react';
import { mockUser } from '../data/mockData';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('Gemini 1.5 Pro / Flash (Hybrid)');
  const [mockApiEnabled, setMockApiEnabled] = useState(true);

  const navItems = [
    { to: '/dashboard', label: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/workspace', label: 'Research Workspace', icon: <Bot className="w-4 h-4 text-blue-400" /> },
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
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
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
          <img 
            src={mockUser.avatarUrl} 
            alt={mockUser.fullName}
            className="w-9 h-9 rounded-full object-cover border border-slate-700" 
          />
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">{mockUser.fullName}</div>
            <div className="text-[10px] text-blue-400 font-mono truncate">{mockUser.researchFlowId}</div>
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
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              9 Research & 4 Academic Agents Ready
            </div>

            <button 
              onClick={() => alert("All 9 autonomous agents are operating with normal latency.")}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="ResearchFlow AI Settings"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Foundation LLM Model Tier</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Gemini 1.5 Pro / Flash (Hybrid)">Gemini 1.5 Pro / Flash (Hybrid)</option>
              <option value="Claude 3.5 Sonnet (Scientific Reasoning)">Claude 3.5 Sonnet (Scientific Reasoning)</option>
              <option value="GPT-4o (General Literature Review)">GPT-4o (General Literature Review)</option>
              <option value="Local Mistral-7B / vLLM (Offline)">Local Mistral-7B / vLLM (Offline)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">FastAPI Backend Connection</label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Mock Data Mode</div>
                <div className="text-[11px] text-slate-400">Use simulated agent stream without running FastAPI</div>
              </div>
              <input
                type="checkbox"
                checked={mockApiEnabled}
                onChange={e => setMockApiEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium">API Endpoint URL</label>
            <input
              type="text"
              defaultValue="http://127.0.0.1:8000/api/v1"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              alert('Settings saved successfully!');
              setSettingsOpen(false);
            }}>
              Save Configuration
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
