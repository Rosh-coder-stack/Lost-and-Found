import React, { useState } from 'react';

export default function SignUpScreen({ onNavigate, onSignUpSuccess }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('Please agree to the Terms of Service.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onSignUpSuccess({ name: fullName, email });
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col justify-between items-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#EC4899]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-md px-4 z-10 my-auto">
        <div className="glass-card rounded-2xl p-8 md:p-10 border border-[#3F3F46]/60 shadow-2xl">
          {/* Brand Identity */}
          <div className="text-center mb-8">
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-2 tracking-tight">
              FoundIt
            </h1>
            <p className="text-sm text-[#A1A1AA]">
              Join the elite community finding what matters.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Full Name</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                  person
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                  lock
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#ccc3d8] block ml-1">Confirm Password</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                  lock_reset
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#3F3F46] bg-[#18181B] text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#ccc3d8] cursor-pointer select-none">
                I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d2bbff] hover:underline">Terms of Service</a> and <a href="#" onClick={(e) => e.preventDefault()} className="text-[#d2bbff] hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Social Signup Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3F3F46]/60"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-[#27272A] px-3 text-[#958da1] font-semibold rounded-full border border-[#3F3F46]/40">
                OR CONTINUE WITH
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => onSignUpSuccess({ name: 'Google User', email: 'user@gmail.com' })}
              className="flex items-center justify-center gap-2 border border-[#3F3F46] rounded-xl py-2.5 hover:bg-[#353437] transition-colors cursor-pointer text-xs text-white"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </button>

            <button 
              onClick={() => onSignUpSuccess({ name: 'GitHub Developer', email: 'dev@github.com' })}
              className="flex items-center justify-center gap-2 border border-[#3F3F46] rounded-xl py-2.5 hover:bg-[#353437] transition-colors cursor-pointer text-xs text-white"
            >
              <span className="material-symbols-outlined text-base">terminal</span>
              <span>GitHub</span>
            </button>
          </div>

          {/* Redirect to Login */}
          <p className="text-center text-xs text-[#ccc3d8]">
            Already have an account?{' '}
            <button
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
