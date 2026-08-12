import React, { useState, useRef, useEffect } from 'react';

export default function Navbar({ currentScreen, onNavigate, user, onLogout, onOpenReport }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    // Profile page placeholder for future implementation
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  // Get user initials for avatar
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131315]/85 backdrop-blur-xl border-b border-[#3F3F46]/50 shadow-sm h-20 transition-all">
      <div className="max-w-[1280px] mx-auto px-6 h-full flex justify-between items-center">
        {/* Brand Logo & Name */}
        <button 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-2xl">
              location_on
            </span>
          </div>
          <span className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-[#e5e1e4] tracking-tight">
            FoundIt
          </span>
        </button>

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Dashboard Nav Link if on landing page */}
              {currentScreen !== 'dashboard' && (
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">space_dashboard</span>
                  Dashboard
                </button>
              )}

              {/* User Profile Dropdown Trigger */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer focus:outline-none ${
                    isDropdownOpen
                      ? 'bg-white/10 border-[#7C3AED] shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                      : 'bg-[#18181B] border-[#3F3F46]/60 hover:border-[#7C3AED]/60 hover:bg-white/5'
                  }`}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                >
                  {/* User Avatar Circle */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {userInitials}
                  </div>

                  {/* User Name */}
                  <span className="font-medium text-sm text-[#e5e1e4] max-w-[130px] truncate hidden sm:inline-block">
                    {user.name || 'Account'}
                  </span>

                  {/* Dropdown Chevron */}
                  <span
                    className={`material-symbols-outlined text-lg text-[#A1A1AA] transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-white' : ''
                    }`}
                  >
                    keyboard_arrow_down
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#131316]/95 backdrop-blur-2xl border border-[#3F3F46]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* User Info Header */}
                    <div className="px-3 py-3 border-b border-[#27272A] mb-1">
                      <p className="text-sm font-bold text-white truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-[#A1A1AA] truncate mt-0.5">
                        {user.email || ''}
                      </p>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-1">
                      {/* Profile Option */}
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#e5e1e4] hover:bg-white/10 transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center text-[#d2bbff] group-hover:bg-[#7C3AED] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">Profile</p>
                        </div>
                      </button>

                      {/* Dashboard Option */}
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate('dashboard');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#e5e1e4] hover:bg-white/10 transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#ffb0cd]/15 flex items-center justify-center text-[#ffb0cd] group-hover:bg-[#EC4899] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">space_dashboard</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">Dashboard</p>
                        </div>
                      </button>

                      {/* Divider */}
                      <div className="border-t border-[#27272A] my-1"></div>

                      {/* Logout Option */}
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Log Out</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Login Button (when not logged in) */
            <button
              onClick={() => onNavigate('login')}
              className="font-['Inter'] text-sm md:text-base px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold primary-glow hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
