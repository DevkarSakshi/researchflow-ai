import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Cpu, Lock, UserCheck, ArrowRight, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { GoogleSignInButton } from '../../components/auth/GoogleSignInButton';
import { request } from '../../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [researchFlowId, setResearchFlowId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [resetErrorMessage, setResetErrorMessage] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
  e.preventDefault();

  if (!researchFlowId.trim()) {
    alert('Please enter your ResearchFlow ID');
    return;
  }

  if (!password.trim()) {
    alert('Please enter your password');
    return;
  }

  try {
    setIsLoading(true);
    const result = await request<{
      researchflow_id: string;
      name: string;
      access_token: string;
      token_type: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        researchflow_id: researchFlowId,
        password: password,
      }),
    });

    localStorage.setItem('researchflow_token', result.access_token);
    localStorage.setItem('researchflow_id', result.researchflow_id);
    localStorage.setItem('researchflow_name', result.name);

    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed. Please check your ResearchFlow ID and password.');
  } finally {
  setIsLoading(false);
  }
}

  async function handleSendResetLink(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetErrorMessage('Please enter your registered email address.');
      return;
    }

    try {
      setResetLoading(true);
      setResetErrorMessage(null);
      setResetSuccessMessage(null);

      const result = await request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail.trim() }),
      });

      setResetSuccessMessage(result.message);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unable to request password reset.';
      setResetErrorMessage(errorMsg);
    } finally {
      setResetLoading(false);
    }
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
                placeholder="e.g. RF-8W66SL"
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
                placeholder="Enter your password"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
            {isLoading ? 'Signing In...' : 'Sign In to Research Environment'}
          </Button>
        </form>

        {/* Google Error Message */}
        {googleError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="flex-1 leading-relaxed">{googleError}</div>
          </div>
        )}

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-mono shrink-0">
            or continue with
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Google Sign In */}
        <GoogleSignInButton
          text="continue_with"
          disabled={isLoading}
          onSuccess={(data) => {
            localStorage.setItem('researchflow_token', data.access_token);
            localStorage.setItem('researchflow_id', data.researchflow_id);
            localStorage.setItem('researchflow_name', data.name);
            navigate('/dashboard');
          }}
          onError={(msg) => setGoogleError(msg)}
        />

        {/* Create Account Link */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have a ResearchFlow ID yet?{' '}
          <Link to="/create-account" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2">
            Create Account
          </Link>
        </div>


        <div className="text-center text-[11px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          Use your ResearchFlow ID and password to sign in.
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => {
          setForgotModalOpen(false);
          setResetErrorMessage(null);
          setResetSuccessMessage(null);
        }}
        title="Reset ResearchFlow Password"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5">
            <KeyRound className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-white">Institutional Identity Recovery</div>
              <div className="text-slate-400 mt-0.5">
                ResearchFlow IDs are linked to academic research labs. Enter your registered email address to receive a secure password reset link.
              </div>
            </div>
          </div>

          {resetSuccessMessage ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-emerald-200">Reset Request Dispatched</div>
                  <div className="text-slate-300 mt-1 leading-relaxed">
                    {resetSuccessMessage}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Please check your inbox or spam folder for an email containing your password reset link.
              </p>
              <div className="flex justify-end pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setForgotModalOpen(false);
                    setResetSuccessMessage(null);
                    setResetErrorMessage(null);
                  }}
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendResetLink} className="space-y-4">
              {resetErrorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{resetErrorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Academic or Institutional Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="e.g. researcher@university.edu"
                  required
                  disabled={resetLoading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={resetLoading}
                  onClick={() => {
                    setForgotModalOpen(false);
                    setResetErrorMessage(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={resetLoading}
                  icon={resetLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : undefined}
                >
                  {resetLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};
