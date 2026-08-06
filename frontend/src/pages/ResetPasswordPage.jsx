import React, { useState, useEffect } from 'react';
import { resetPasswordUser } from '../services/authService.js';

export default function ResetPasswordPage({ onNavigate, showToast }) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Extract token from URL query parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Input Validation
    if (!token.trim()) {
      setErrorMsg('Reset token is required. Please check your email reset link.');
      return;
    }

    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your entries.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // 2. Call backend API endpoint POST /api/v1/auth/reset-password
      const data = await resetPasswordUser(token.trim(), newPassword);
      
      const successMessage = data.message || 'Password has been reset successfully!';
      setSuccessMsg(successMessage);

      if (showToast) {
        showToast('Password reset successful! Please log in with your new password.');
      }

      // 3. Redirect to Login page after a short delay
      setTimeout(() => {
        onNavigate('login');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. The link may be invalid or expired.');
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
              <span className="material-symbols-outlined text-white text-2xl">key</span>
            </div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-2 tracking-tight">
              Reset Password
            </h1>
            <p className="text-sm text-[#A1A1AA]">
              Enter your new password below to reset your account credentials.
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
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-emerald-400">check_circle</span>
              <p className="font-bold">{successMsg}</p>
              <p className="text-xs text-emerald-400/80">Redirecting to Login page...</p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Reset Token Input (Hidden or auto-filled, visible if empty) */}
              {!token && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Reset Token</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                      vpn_key
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter reset token from email"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#ccc3d8] block ml-1">New Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                    lock
                  </span>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Confirm New Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                    lock_reset
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
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
            Back to{' '}
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
