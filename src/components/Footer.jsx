import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-[#0e0e10] border-t border-[#3F3F46]">
      <div className="max-w-[1280px] mx-auto px-6 py-16 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand Info */}
        <div className="flex flex-col gap-6 max-w-xs">
          <div className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold bg-gradient-to-r from-[#7C3AED] to-[#EC4899] bg-clip-text text-transparent">
            FoundIt
          </div>
          <p className="text-[#ccc3d8] text-sm leading-relaxed">
            Making the world a little smaller, one found item at a time. The world's leading premium lost and found platform.
          </p>
          <div className="flex gap-4">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); }}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-[#d2bbff] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">public</span>
            </a>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); }}
              className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:text-[#d2bbff] transition-colors"
            >
              <span className="material-symbols-outlined text-lg">alternate_email</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="flex flex-col gap-4">
            <h5 className="text-white font-bold uppercase tracking-widest text-xs">Platform</h5>
            <button onClick={() => onNavigate('landing')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Home
            </button>
            <button onClick={() => onNavigate('dashboard')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Browse Items
            </button>
            <button onClick={() => onNavigate('dashboard')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Global Search
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-white font-bold uppercase tracking-widest text-xs">Company</h5>
            <button onClick={() => onNavigate('landing')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              About Us
            </button>
            <button onClick={() => onNavigate('landing')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Help Center
            </button>
            <button onClick={() => onNavigate('dashboard')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Success Stories
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="text-white font-bold uppercase tracking-widest text-xs">Legal</h5>
            <button onClick={() => onNavigate('signup')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('signup')} className="text-left text-[#ccc3d8] text-sm hover:text-[#ffb0cd] transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1280px] mx-auto px-6 py-8 border-t border-[#3F3F46]/30 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#ccc3d8]">
        <p>© 2024 FoundIt Premium. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-[#d2bbff] transition-colors">Status</span>
          <span className="cursor-pointer hover:text-[#d2bbff] transition-colors">Cookies</span>
        </div>
      </div>
    </footer>
  );
}
