import React, { useState } from 'react';

export default function Navbar({ currentScreen, onNavigate, user, onLogout, onOpenReport }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If we are on transactional screens (Login / SignUp), we show minimal or full navbar based on screen
  const isAuthScreen = currentScreen === 'login' || currentScreen === 'signup';

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131315]/85 backdrop-blur-xl border-b border-[#3F3F46]/50 shadow-sm h-20 transition-all">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex justify-between items-center">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-8">
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

          {/* Nav Links for Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className={`font-['Inter'] text-base transition-colors duration-200 cursor-pointer ${
                currentScreen === 'landing'
                  ? 'text-[#d2bbff] font-bold border-b-2 border-[#d2bbff] pb-1'
                  : 'text-[#ccc3d8] hover:text-[#d2bbff]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`font-['Inter'] text-base transition-colors duration-200 cursor-pointer ${
                currentScreen === 'dashboard'
                  ? 'text-[#d2bbff] font-bold border-b-2 border-[#d2bbff] pb-1'
                  : 'text-[#ccc3d8] hover:text-[#d2bbff]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="font-['Inter'] text-base text-[#ccc3d8] hover:text-[#d2bbff] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="font-['Inter'] text-base text-[#ccc3d8] hover:text-[#d2bbff] transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => onNavigate('landing')}
              className="font-['Inter'] text-base text-[#ccc3d8] hover:text-[#d2bbff] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Screen Switcher Pill & Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Screen Quick Selector for Demo Review */}
          <div className="hidden lg:flex items-center bg-[#201f22] border border-[#3F3F46] rounded-full p-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'landing' ? 'bg-[#7C3AED] text-white shadow' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'dashboard' ? 'bg-[#7C3AED] text-white shadow' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'signup' ? 'bg-[#7C3AED] text-white shadow' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => onNavigate('login')}
              className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                currentScreen === 'login' ? 'bg-[#7C3AED] text-white shadow' : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Login
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenReport}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-sm font-bold primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Report Lost Item
              </button>
              <div className="flex items-center gap-2 bg-[#27272A] border border-[#3F3F46] px-3 py-1.5 rounded-full">
                <div className="w-7 h-7 rounded-full bg-[#7C3AED] text-white font-bold flex items-center justify-center text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <span className="text-sm font-medium text-[#e5e1e4] hidden sm:inline">{user.name || 'Alex'}</span>
                <button
                  onClick={onLogout}
                  title="Log out"
                  className="text-[#A1A1AA] hover:text-red-400 text-xs ml-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => onNavigate('login')}
                className="font-['Inter'] text-sm md:text-base font-medium px-4 py-2 rounded-lg text-[#ccc3d8] hover:text-[#d2bbff] transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => onNavigate('signup')}
                className="font-['Inter'] text-sm md:text-base px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#e5e1e4] p-2 rounded-lg hover:bg-[#27272A] cursor-pointer"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#18181B] border-b border-[#3F3F46] px-6 py-4 flex flex-col gap-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2 border-b border-[#3F3F46] pb-3">
            <span className="text-xs uppercase font-semibold text-[#A1A1AA] tracking-wider mb-1">Select View</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${currentScreen === 'landing' ? 'bg-[#7C3AED] text-white' : 'bg-[#27272A] text-[#ccc3d8]'}`}
              >
                Landing Page
              </button>
              <button
                onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${currentScreen === 'dashboard' ? 'bg-[#7C3AED] text-white' : 'bg-[#27272A] text-[#ccc3d8]'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => { onNavigate('signup'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${currentScreen === 'signup' ? 'bg-[#7C3AED] text-white' : 'bg-[#27272A] text-[#ccc3d8]'}`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-left ${currentScreen === 'login' ? 'bg-[#7C3AED] text-white' : 'bg-[#27272A] text-[#ccc3d8]'}`}
              >
                Login
              </button>
            </div>
          </div>

          <button
            onClick={() => { onNavigate('landing'); setMobileMenuOpen(false); }}
            className="text-left font-['Inter'] text-base text-[#e5e1e4] hover:text-[#d2bbff] py-1"
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
            className="text-left font-['Inter'] text-base text-[#e5e1e4] hover:text-[#d2bbff] py-1"
          >
            Dashboard
          </button>
          <button
            onClick={() => { onOpenReport(); setMobileMenuOpen(false); }}
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined">report</span>
            Report Lost Item
          </button>
        </div>
      )}
    </nav>
  );
}
