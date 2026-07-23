import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { RoutePage } from '../../types';
import {
  Search,
  PlusCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  Menu,
  X,
  Bell,
  LogOut,
  SlidersHorizontal,
  Home,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeRoute, navigateTo } = useNavigation();
  const { currentUser, users, loginAs, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems: { label: string; route: RoutePage; icon: React.ReactNode }[] = [
    { label: 'Home', route: 'home', icon: <Home className="w-4 h-4" /> },
    { label: 'Browse & Search', route: 'search', icon: <Search className="w-4 h-4" /> },
    { label: 'Report Found', route: 'report-found', icon: <PlusCircle className="w-4 h-4" /> },
    { label: 'Report Lost', route: 'report-lost', icon: <AlertTriangle className="w-4 h-4" /> },
    { label: 'Dashboard', route: 'dashboard', icon: <SlidersHorizontal className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin Console', route: 'admin', icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> });
  }

  const handleNavClick = (route: RoutePage) => {
    navigateTo(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e7f1] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <div className="w-10 h-10 rounded-xl bg-[#00288e] flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <span className="material-symbols-outlined text-2xl">location_on</span>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#00288e] block leading-none">
                CAMPUS
              </span>
              <span className="text-xs font-semibold text-[#505f76] tracking-wider uppercase">
                Lost & Found Portal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = activeRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => handleNavClick(item.route)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#eeedf7] text-[#00288e] font-semibold'
                      : 'text-[#444653] hover:bg-[#f4f2fc] hover:text-[#00288e]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls: Role Switcher & Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Quick Demo Role Switcher */}
            <div className="hidden lg:flex items-center bg-[#f4f2fc] p-1 rounded-lg border border-[#e8e7f1] text-xs">
              <span className="px-2 font-medium text-[#757684]">Switch User:</span>
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => loginAs(u.id)}
                  className={`px-2 py-1 rounded-md font-semibold transition-all ${
                    currentUser.id === u.id
                      ? 'bg-[#00288e] text-white shadow-xs'
                      : 'text-[#444653] hover:text-[#00288e]'
                  }`}
                  title={u.role === 'admin' ? 'Administrator' : 'Student'}
                >
                  {u.name.split(' ')[0]} {u.role === 'admin' ? '(Admin)' : ''}
                </button>
              ))}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-full text-[#444653] hover:bg-[#f4f2fc] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#e8e7f1] py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-[#eeedf7] flex justify-between items-center">
                    <span className="font-bold text-sm text-[#1a1b22]">Notifications</span>
                    <span className="text-xs bg-[#00288e]/10 text-[#00288e] px-2 py-0.5 rounded-full font-semibold">2 New</span>
                  </div>
                  <div className="divide-y divide-[#eeedf7] max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-[#fbf8ff] cursor-pointer transition-colors" onClick={() => { setNotificationsOpen(false); navigateTo('profile'); }}>
                      <p className="text-xs font-semibold text-[#1a1b22]">Proof requested for AirPods Pro</p>
                      <p className="text-xs text-[#757684] mt-0.5">Admin requested device Bluetooth verification photo.</p>
                      <span className="text-[10px] text-[#00288e] mt-1 block">1 hour ago</span>
                    </div>
                    <div className="p-3 hover:bg-[#fbf8ff] cursor-pointer transition-colors" onClick={() => { setNotificationsOpen(false); navigateTo('item-details', 'itm_001'); }}>
                      <p className="text-xs font-semibold text-[#1a1b22]">Similar item reported</p>
                      <p className="text-xs text-[#757684] mt-0.5">Silver MacBook Pro matched your search radius.</p>
                      <span className="text-[10px] text-[#00288e] mt-1 block">3 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-full border border-[#e8e7f1] hover:border-[#00288e] transition-colors bg-white"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#e8e7f1] py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-[#eeedf7]">
                    <p className="font-bold text-sm text-[#1a1b22] truncate">{currentUser.name}</p>
                    <p className="text-xs text-[#757684] truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center space-x-1 text-xs font-semibold text-[#00288e]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentUser.department || 'Verified Student'}</span>
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigateTo('profile'); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#444653] hover:bg-[#f4f2fc] flex items-center space-x-2"
                    >
                      <User className="w-4 h-4" />
                      <span>My Profile & Claims</span>
                    </button>
                    <button
                      onClick={() => { setUserDropdownOpen(false); navigateTo('dashboard'); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#444653] hover:bg-[#f4f2fc] flex items-center space-x-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>My Dashboard</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setUserDropdownOpen(false); navigateTo('admin'); }}
                        className="w-full text-left px-4 py-2 text-sm text-amber-700 font-semibold hover:bg-amber-50 flex items-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Console</span>
                      </button>
                    )}
                  </div>
                  <div className="border-t border-[#eeedf7] pt-1">
                    <button
                      onClick={() => { setUserDropdownOpen(false); logout(); navigateTo('login'); }}
                      className="w-full text-left px-4 py-2 text-sm text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#444653] hover:bg-[#f4f2fc]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e8e7f1] bg-white px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavClick(item.route)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-base font-medium ${
                activeRoute === item.route
                  ? 'bg-[#eeedf7] text-[#00288e] font-bold'
                  : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          {/* Role Switcher inside Mobile Menu */}
          <div className="pt-3 border-t border-[#eeedf7]">
            <p className="text-xs font-semibold text-[#757684] mb-2 uppercase">Switch Account:</p>
            <div className="grid grid-cols-2 gap-2">
              {users.map(u => (
                <button
                  key={u.id}
                  onClick={() => { loginAs(u.id); setMobileMenuOpen(false); }}
                  className={`p-2 rounded-lg text-xs font-semibold border text-left ${
                    currentUser.id === u.id
                      ? 'border-[#00288e] bg-[#eeedf7] text-[#00288e]'
                      : 'border-[#e8e7f1] text-[#444653]'
                  }`}
                >
                  <p>{u.name}</p>
                  <p className="text-[10px] text-[#757684] capitalize">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
