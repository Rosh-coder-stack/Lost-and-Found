import React, { useState, useEffect } from 'react';
import { loginUser, getGoogleAuthUrl } from '../services/authService.js';

// Premium Futuristic Detective Panel with Looping Investigation Telemetry
const DetectivePanel = () => {
  const [phase, setPhase] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [footerEgg, setFooterEgg] = useState(false);

  const items = [
    { icon: 'key', name: 'Lost Keys', tag: 'RFID Signal', isTarget: false },
    { icon: 'account_balance_wallet', name: 'Leather Wallet', tag: 'Card Vault', isTarget: false },
    { icon: 'headphones', name: 'AirPods Max', tag: 'BLE Pulse', isTarget: false },
    { icon: 'earbuds', name: 'Lost AirPods', tag: 'Last seen: “somewhere”', isTarget: true }
  ];

  // Looping Scanning Animation Cycle
  useEffect(() => {
    let timer;
    if (phase === 0) {
      // Step through regular items (0, 1, 2)
      timer = setTimeout(() => {
        if (activeItemIdx < 2) {
          setActiveItemIdx((prev) => prev + 1);
        } else {
          // Lock onto target item: Lost AirPods
          setActiveItemIdx(3);
          setPhase(1); // 1: POSSIBLE MATCH
        }
      }, 1400);
    } else if (phase === 1) {
      // 1. POSSIBLE MATCH -> 2. Analyzing...
      timer = setTimeout(() => setPhase(2), 1600);
    } else if (phase === 2) {
      // 2. Analyzing... -> 3. Confidence: 12%
      timer = setTimeout(() => setPhase(3), 1800);
    } else if (phase === 3) {
      // 3. Confidence: 12% -> 4. Yeah... we need more clues.
      timer = setTimeout(() => setPhase(4), 1800);
    } else if (phase === 4) {
      // 4. Yeah... we need more clues. -> Return to 0: SCANNING
      timer = setTimeout(() => {
        setPhase(0);
        setActiveItemIdx(0);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [phase, activeItemIdx]);

  // Bottom Footer Easter Egg Cycle
  useEffect(() => {
    const eggTimer = setInterval(() => {
      setFooterEgg((prev) => !prev);
    }, 5500);
    return () => clearInterval(eggTimer);
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between h-full relative z-10 font-['Inter',sans-serif]">
      {/* Background Subtle Mesh */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #7C3AED 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header & Dynamic Telemetry Status */}
      <div className="relative z-10">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 gap-2">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EC4899] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C3AED]"></span>
            </span>
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#d2bbff] font-extrabold">
              DETECTIVE MODE
            </span>
          </div>

          {/* Dynamic Telemetry Status Badge */}
          <div className="flex-shrink-0">
            {phase === 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7C3AED]/20 text-[#d2bbff] border border-[#7C3AED]/40">
                SCANNING
              </span>
            )}
            {phase === 1 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EC4899]/25 text-[#ffb0cd] border border-[#EC4899]/50 animate-pulse shadow-[0_0_12px_rgba(236,72,153,0.35)]">
                POSSIBLE MATCH
              </span>
            )}
            {phase === 2 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7C3AED]/25 text-[#d2bbff] border border-[#7C3AED]/50 animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d2bbff] animate-ping"></span>
                Analyzing...
              </span>
            )}
            {phase === 3 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Confidence: 12%
              </span>
            )}
            {phase === 4 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-in fade-in zoom-in-95 duration-200">
                Yeah... we need more clues.
              </span>
            )}
          </div>
        </div>

        {/* Main Status Text */}
        <p className="text-xs text-[#A1A1AA] mt-3 font-medium">
          Cross-referencing lost stuff...
        </p>
      </div>

      {/* Investigation List & Scanner Track */}
      <div className="relative py-4 my-auto">
        {/* Connecting Vertical Track */}
        <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-[#7C3AED]/40 via-[#EC4899]/40 to-[#d2bbff]/40"></div>

        {/* Floating Reticle Indicator */}
        <div 
          className="absolute left-0.5 w-9 h-9 rounded-full border border-[#EC4899] bg-[#7C3AED]/25 backdrop-blur-md flex items-center justify-center text-white shadow-[0_0_18px_rgba(236,72,153,0.5)] transition-all duration-700 ease-out z-20 pointer-events-none"
          style={{ top: `${activeItemIdx * 25 + 4}%` }}
        >
          <span className="material-symbols-outlined text-[18px] animate-pulse text-[#ffb0cd]">
            search
          </span>
          <div className="absolute -inset-1 rounded-full border border-[#7C3AED]/40 animate-ping"></div>
        </div>

        {/* Items List */}
        <div className="space-y-3 relative z-10">
          {items.map((item, idx) => {
            const isScanning = activeItemIdx === idx;
            const isTarget = item.isTarget;

            return (
              <div 
                key={item.name}
                className={`flex items-center gap-3.5 pl-12 pr-3.5 py-2.5 rounded-xl border transition-all duration-500 ${
                  isTarget && isScanning
                    ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#EC4899]/15 border-[#EC4899]/70 shadow-[0_0_22px_rgba(236,72,153,0.25)] translate-x-1'
                    : isScanning
                    ? 'bg-white/10 border-[#7C3AED]/70 shadow-[0_0_18px_rgba(124,58,237,0.2)] translate-x-1'
                    : isTarget
                    ? 'bg-[#18181B]/50 border-purple-500/20 opacity-80'
                    : 'bg-[#18181B]/35 border-white/5 opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isTarget && isScanning
                    ? 'bg-gradient-to-br from-[#EC4899] to-[#ffb0cd] text-black shadow-md scale-105 font-bold'
                    : isScanning 
                    ? 'bg-gradient-to-br from-[#7C3AED] to-[#EC4899] text-white shadow-md scale-105' 
                    : 'bg-white/5 text-[#A1A1AA]'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {item.icon}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold transition-colors ${
                    isTarget && isScanning ? 'text-white font-extrabold' : isScanning ? 'text-white' : 'text-[#A1A1AA]'
                  }`}>
                    {item.name}
                  </p>
                  <p className={`text-[10px] font-mono transition-colors ${
                    isTarget ? 'text-[#ffb0cd] font-medium' : 'text-[#71717A]'
                  }`}>
                    {item.tag}
                  </p>
                </div>

                {/* Glowing MATCH? Badge */}
                {isTarget && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1 ${
                    isScanning
                      ? 'bg-[#EC4899]/30 text-[#ffb0cd] border border-[#EC4899]/60 shadow-[0_0_10px_rgba(236,72,153,0.4)] animate-pulse'
                      : 'bg-[#7C3AED]/15 text-[#d2bbff] border border-[#7C3AED]/30 opacity-70'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
                    MATCH?
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Easter Egg Status */}
      <div className="pt-3.5 border-t border-white/10 relative z-10 flex items-center justify-between">
        <p className="text-[11px] text-[#A1A1AA] font-mono flex items-center gap-2 transition-all duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
          <span>
            {footerEgg ? "No clues? We're working on it." : "Detective work in progress..."}
          </span>
        </p>
        <span className="text-[10px] font-mono text-[#71717A]">
          STATUS
        </span>
      </div>
    </div>
  );
};

export default function LoginPage({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('alex.miller@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Step 1: Input Validation - Check that both email and password are provided
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Step 2: Clear any previous error and enable loading state (disables submit button)
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      // Step 3: Call backend API endpoint POST http://localhost:5001/api/v1/auth/login via authService
      const responseData = await loginUser(email, password);

      // Step 4: On successful login:
      // Store JWT token in localStorage under key 'token'
      if (responseData.token) {
        localStorage.setItem('token', responseData.token);
      }

      // Store user object in localStorage under key 'user'
      if (responseData.user) {
        localStorage.setItem('user', JSON.stringify(responseData.user));
      }

      // Step 5: Trigger success callback to update app state and redirect to Dashboard/Home page
      onLoginSuccess(responseData.user);
    } catch (err) {
      // Step 6: On login failure:
      setErrorMsg(err.message || 'Login failed. Please try again.');
    } finally {
      // Step 7: Reset submitting state to re-enable button
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-12 flex flex-col justify-between items-center relative overflow-hidden font-['Inter',sans-serif]">
      {/* Ambient Light Blobs */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-[90px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 -left-20 w-96 h-96 bg-[#EC4899]/20 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-4xl px-4 z-10 my-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Futuristic Detective Console */}
          <div className="hidden md:flex md:col-span-5 rounded-2xl glass-card p-6 border border-[#3F3F46]/50 bg-[#131316]/90 shadow-2xl relative overflow-hidden">
            <DetectivePanel />
          </div>

          {/* Right Column: Main Login Form Card */}
          <div className="md:col-span-7 glass-card rounded-2xl p-8 md:p-10 border border-[#3F3F46]/60 shadow-2xl bg-[#131316]/95">
            {/* Header */}
            <div className="text-center md:text-left mb-8">
              <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-bold text-white mb-2 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-sm text-[#A1A1AA]">
                Your missing stuff missed you too.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-medium text-[#ccc3d8] block">Password</label>
                  <button 
                    type="button" 
                    onClick={() => onNavigate('forgot-password')} 
                    className="text-xs text-[#d2bbff] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1] text-lg group-focus-within:text-[#d2bbff] transition-colors">
                    lock
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-10 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#958da1] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 py-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#3F3F46] bg-[#18181B] text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs text-[#ccc3d8] cursor-pointer select-none">
                  Remember me on this device
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Log In</span>
                    <span className="material-symbols-outlined text-lg">login</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#3F3F46]/60"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-[#27272A] px-3 text-[#958da1] font-semibold rounded-full border border-[#3F3F46]/40">
                  OR
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button 
              type="button"
              onClick={() => { window.location.href = getGoogleAuthUrl(); }}
              className="w-full flex items-center justify-center gap-3 border border-[#3F3F46] rounded-xl py-3 hover:bg-[#353437] transition-colors cursor-pointer text-sm text-white font-medium mb-6"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Log in with Google</span>
            </button>

            {/* Redirect to Sign Up */}
            <p className="text-center text-xs text-[#ccc3d8]">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-[#d2bbff] font-bold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
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
