import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Lock, User, CheckCircle2, Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Generate unique ResearchFlow ID as a frontend demo
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const labCode = name.trim().split(' ')[0].toUpperCase();
    const newId = `RF-${randomDigits}-${labCode}`;
    setGeneratedId(newId);
  }

  function copyToClipboard() {
    if (generatedId) {
      navigator.clipboard.writeText(generatedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Research Account</h1>
          <p className="text-xs text-slate-400">Register for your personal Autonomous AI Research Space</p>
        </div>

        {/* If generated ID is available, show success state */}
        {generatedId ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Registration Successful!</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Welcome aboard, <strong className="text-emerald-400">{name}</strong>! Your unique institutional credential has been generated:
                </p>
              </div>

              {/* ResearchFlow ID Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 space-y-2">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Your ResearchFlow ID
                </div>
                <div className="text-xl font-mono font-bold text-white tracking-widest text-emerald-400">
                  {generatedId}
                </div>
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition cursor-pointer font-sans"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied ID!' : 'Copy ResearchFlow ID'}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                Save this ID. You will use it alongside your password to access your autonomous research environment.
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Enter Research Workspace
            </Button>
          </div>
        ) : (
          /* Account Creation Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name / Scholar Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Aishwari Sharma"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
              Generate ResearchFlow ID & Register
            </Button>
          </form>
        )}

        {/* Back to Login */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Already have a ResearchFlow ID?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
