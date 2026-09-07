import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('aishwari.s@cs.university.edu');
  const [password, setPassword] = useState('••••••••••••');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ResearchFlow AI</h1>
          <p className="text-xs text-slate-400">Autonomous Multi-Agent Academic & Literature OS</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Academic Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
            Sign In to Research Environment
          </Button>
        </form>

        <div className="text-center text-[11px] text-slate-500">
          Demo Mode: Click "Sign In" with prefilled credentials to explore all 13 agents.
        </div>
      </div>
    </div>
  );
};
