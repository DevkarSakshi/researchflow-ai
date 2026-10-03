import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Cpu, Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { request } from '../../services/api';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setTokenValid(false);
      setTokenError('No password reset token was provided in the link.');
      return;
    }

    async function checkToken() {
      try {
        setIsVerifying(true);
        await request<{ valid: boolean }>(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        setTokenValid(true);
        setTokenError(null);
      } catch (err: unknown) {
        setTokenValid(false);
        const msg = err instanceof Error ? err.message : 'Invalid or expired password reset link.';
        // Extract friendly error text if API formatted
        if (msg.includes('400')) {
          setTokenError('This password reset link is invalid, has expired, or has already been used.');
        } else {
          setTokenError(msg);
        }
      } finally {
        setIsVerifying(false);
      }
    }

    checkToken();
  }, [token]);

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await request<{ message: string; researchflow_id?: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          new_password: newPassword,
        }),
      });

      setSubmitSuccess(res.message);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Cpu className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400">ResearchFlow AI Secure Password Recovery</p>
        </div>

        {/* Verifying Token State */}
        {isVerifying && (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Verifying your security token...</p>
          </div>
        )}

        {/* Invalid or Expired Token State */}
        {!isVerifying && !tokenValid && (
          <div className="space-y-5">
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <div className="font-semibold text-rose-200">Unable to Reset Password</div>
                <div className="text-slate-300 mt-1 leading-relaxed">{tokenError}</div>
              </div>
            </div>

            <div className="text-center space-y-3 pt-2">
              <p className="text-xs text-slate-400">
                Password reset tokens expire after 15 minutes and can only be used once.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Return to Sign In
              </Button>
            </div>
          </div>
        )}

        {/* Success State */}
        {!isVerifying && tokenValid && submitSuccess && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-200">Password Updated Successfully</div>
                <div className="text-slate-300 mt-1 leading-relaxed">{submitSuccess}</div>
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/login')}
            >
              Sign In with New Password
            </Button>
          </div>
        )}

        {/* Password Reset Form State */}
        {!isVerifying && tokenValid && !submitSuccess && (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            {submitError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2.5 text-slate-300">
              <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Enter a new password with at least 6 characters.</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 chars)"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  disabled={isSubmitting}
                  minLength={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={isSubmitting}
              icon={isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </form>
        )}

        {/* Back to Login Link */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
