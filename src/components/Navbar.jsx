import React from 'react';

export default function Navbar({ onNavigate }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131315]/85 backdrop-blur-xl border-b border-[#3F3F46]/50 shadow-sm h-20 transition-all">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex justify-between items-center">
        {/* Brand Logo & Name */}
        <button 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <span className="material-symbols-outlined text-[#d2bbff] text-3xl group-hover:scale-110 transition-transform">
            location_on
          </span>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-[#e5e1e4] tracking-tight">
            FoundIt
          </span>
        </button>

        {/* Login Option on Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('login')}
            className="font-['Inter'] text-sm md:text-base px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold primary-glow hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">login</span>
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}

