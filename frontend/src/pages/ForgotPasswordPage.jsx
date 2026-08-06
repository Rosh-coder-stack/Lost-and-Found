import React, { useState } from 'react';
import { forgotPasswordUser } from '../services/authService.js';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Input Validation
    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // 2. Call backend API
      const data = await forgotPasswordUser(email.trim());
      setSuccessMsg(data.message || 'Password reset link has been sent to your email address.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Ambient Light Blobs */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#EC4899]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-md px-4 z-10 my-auto">
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-[#3F3F46]/60 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center mx-auto mb-4 primary-glow">
              <span className="material-symbols-outlined text-white text-2xl">lock_reset</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-2 tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-sm text-[#A1A1AA]">
              No worries! Enter your account email address and we'll send you a password reset link.
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMsg ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center flex flex-col items-center gap-2">
                <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
                <p className="font-medium">{successMsg}</p>
                <p className="text-xs text-emerald-400/80">
                  Please check your inbox (and spam folder) for the password reset instructions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Back to Login</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <span className="material-symbols-outlined text-lg">send</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Divider & Back to Login */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3F3F46]/60"></div>
            </div>
          </div>

          <p className="text-center text-xs text-[#ccc3d8]">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="text-[#d2bbff] font-bold hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#3F3F46]/50 bg-[#0e0e10]/80 py-6 mt-8">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#ccc3d8]">
          <div className="font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent text-lg">
            FoundIt
          </div>
          <p>© 2024 FoundIt Premium. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ffb0cd]">Privacy Policy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ffb0cd]">Terms of Service</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-[#ffb0cd]">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
