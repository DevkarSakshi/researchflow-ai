import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bot, 
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
  Cpu
} from 'lucide-react';
import { mockUser } from '../data/mockData';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Main Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/research', label: 'Research Agents (9)', icon: <Bot className="w-4 h-4" /> },
    { to: '/papers', label: 'Paper Intelligence', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/comparison', label: 'Comparison Matrix', icon: <GitCompare className="w-4 h-4" /> },
    { to: '/gaps', label: 'Gaps & Ideas', icon: <Sparkles className="w-4 h-4" /> },
    { to: '/methodology', label: 'Methodology Plan', icon: <Compass className="w-4 h-4" /> },
    { to: '/citations', label: 'Citations & BibTeX', icon: <Quote className="w-4 h-4" /> },
    { to: '/reviewer', label: 'AI Reviewer Report', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/academic', label: 'Academic Workflow (4)', icon: <GraduationCap className="w-4 h-4" /> },
    { to: '/profile', label: 'Student Profile', icon: <User className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col shrink-0">
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

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            Navigation
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
        </nav>

        <div 
          onClick={() => navigate('/profile')}
          className="p-4 border-t border-slate-800/80 flex items-center gap-3 hover:bg-slate-900 cursor-pointer transition"
        >
          <img 
            src={mockUser.avatarUrl} 
            alt={mockUser.fullName}
            className="w-9 h-9 rounded-full object-cover border border-slate-700" 
          />
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">{mockUser.fullName}</div>
            <div className="text-[11px] text-slate-400 truncate">{mockUser.degree}</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 w-72">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search agents, literature, citations..."
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
              onClick={() => alert("All 9 autonomous agents are synchronized and ready.")}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
