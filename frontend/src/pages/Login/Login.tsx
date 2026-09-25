import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Lock, UserCheck, ArrowRight, KeyRound } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [researchFlowId, setResearchFlowId] = useState('RF-9021-STANFORD');
  const [password, setPassword] = useState('••••••••••••');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!researchFlowId.trim()) {
      alert('Please enter your ResearchFlow ID');
      return;
    }
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to ResearchFlow AI</h1>
          <p className="text-xs text-slate-400">Autonomous Multi-Agent Academic & Literature OS</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              ResearchFlow ID
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="text" 
                value={researchFlowId}
                onChange={e => setResearchFlowId(e.target.value)}
                placeholder="e.g. RF-9021-STANFORD"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={() => setForgotModalOpen(true)}
                className="text-[11px] text-blue-400 hover:text-blue-300 transition cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
            Sign In to Research Environment
          </Button>
        </form>

        {/* Create Account Link */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have a ResearchFlow ID yet?{' '}
          <Link to="/create-account" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2">
            Create Account
          </Link>
        </div>

        <div className="text-center text-[11px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 font-mono">
          Demo Credential: <span className="text-slate-300 font-semibold">RF-9021-STANFORD</span> (Any password)
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal 
        isOpen={forgotModalOpen} 
        onClose={() => setForgotModalOpen(false)} 
        title="Reset ResearchFlow Password"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5">
            <KeyRound className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Institutional Identity Recovery</div>
              <div className="text-slate-400 mt-0.5">
                ResearchFlow IDs are linked to academic research labs. You can recover access using your registered student/faculty email address.
              </div>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 mb-1 font-medium">Academic Email</label>
            <input 
              type="email" 
              placeholder="e.g. aishwari.s@cs.university.edu"
              defaultValue="aishwari.s@cs.university.edu"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setForgotModalOpen(false)}>
              Close
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => {
                alert('Password reset link sent to registered academic email! For this frontend demo, use ResearchFlow ID: RF-9021-STANFORD.');
                setForgotModalOpen(false);
              }}
            >
              Send Reset Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
