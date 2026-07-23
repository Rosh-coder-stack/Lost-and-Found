import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ShieldCheck, Mail, Lock, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { loginAs, users } = useAuth();
  const { navigateTo } = useNavigation();

  const [email, setEmail] = useState('j.doe@university.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSSOLogin = (userId: string) => {
    loginAs(userId);
    navigateTo('dashboard');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to student John Doe or match email
    const matched = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || users[0];
    loginAs(matched.id);
    navigateTo('dashboard');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e7f1] shadow-lg overflow-hidden max-w-4xl mx-auto my-8 grid grid-cols-1 md:grid-cols-2">
      
      {/* Left Branding Column */}
      <div className="bg-[#00288e] text-white p-8 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-2xl">
            <span className="material-symbols-outlined text-3xl">location_on</span>
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">University Central Auth</h2>
            <p className="text-xs text-blue-200 mt-2 leading-relaxed">
              Log in with your official student or faculty ID to submit claims, track lost items, and access the campus safety catalog.
            </p>
          </div>
          <div className="space-y-3 pt-4 border-t border-white/20 text-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Campus Police & Safety Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>End-to-End Ownership Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>24/7 Dispatch Integration</span>
            </div>
          </div>
        </div>

        {/* Decorative Circle Graphic */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-blue-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Right Login Form Column */}
      <div className="p-8 flex flex-col justify-center space-y-6">
        
        <div>
          <h3 className="text-xl font-bold text-[#1a1b22]">Sign In to Portal</h3>
          <p className="text-xs text-[#757684] mt-1">Select an account below or enter institutional credentials</p>
        </div>

        {/* Quick Demo One-Click Login Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-[#757684] uppercase tracking-wider">Quick Demo SSO Sign-In:</p>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => handleSSOLogin(u.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-[#e8e7f1] hover:border-[#00288e] hover:bg-[#f4f2fc] transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <img src={u.avatarUrl} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-[#1a1b22]">{u.name}</p>
                  <p className="text-[10px] text-[#757684]">{u.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {u.role === 'admin' ? 'Admin' : 'Student'}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center justify-center my-2">
          <div className="border-t border-[#eeedf7] w-full" />
          <span className="bg-white px-3 text-[10px] text-[#757684] font-bold uppercase relative z-10">Or Custom Login</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-[#444653] cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#e8e7f1] text-[#00288e] focus:ring-[#00288e]"
              />
              <span>Remember me on this device</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your institutional email.'); }} className="text-[#00288e] font-semibold hover:underline">
              Forgot?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#00288e] text-white font-bold text-xs rounded-xl hover:bg-[#1e40af] transition-colors flex items-center justify-center space-x-2 shadow-xs"
          >
            <span>Sign In to Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-[#757684]">
          Need an account?{' '}
          <button onClick={() => navigateTo('register')} className="text-[#00288e] font-bold hover:underline">
            Register Student ID
          </button>
        </p>

      </div>

    </div>
  );
};
