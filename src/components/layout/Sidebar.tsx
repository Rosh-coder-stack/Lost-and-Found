import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { RoutePage } from '../../types';
import {
  LayoutDashboard,
  Search,
  PlusCircle,
  AlertTriangle,
  User,
  ShieldCheck,
  FileCheck,
  Bell,
  Settings,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'overview', onSelectTab }) => {
  const { navigateTo, activeRoute } = useNavigation();
  const { isAdmin } = useAuth();

  const isDashboard = activeRoute === 'dashboard';
  const isAdminRoute = activeRoute === 'admin';

  return (
    <aside className="w-full lg:w-64 bg-white rounded-2xl border border-[#e8e7f1] p-4 shadow-xs shrink-0 h-fit">
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#757684] mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => navigateTo('home')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeRoute === 'home' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#00288e]" />
              <span>Portal Home</span>
            </button>
            <button
              onClick={() => navigateTo('search')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeRoute === 'search' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <Search className="w-4 h-4 text-[#00288e]" />
              <span>Browse Catalog</span>
            </button>
            <button
              onClick={() => navigateTo('report-found')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeRoute === 'report-found' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-[#00288e]" />
              <span>Report Found Item</span>
            </button>
            <button
              onClick={() => navigateTo('report-lost')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeRoute === 'report-lost' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Report Lost Item</span>
            </button>
          </nav>
        </div>

        {/* User Account Section */}
        <div>
          <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-[#757684] mb-2">
            My Workspace
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => { navigateTo('dashboard'); onSelectTab?.('overview'); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isDashboard && activeTab === 'overview' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Student Overview</span>
            </button>
            <button
              onClick={() => { navigateTo('profile'); onSelectTab?.('claims'); }}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeRoute === 'profile' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>My Claims & Proofs</span>
            </button>
          </nav>
        </div>

        {/* Admin Tools Section if Admin */}
        {isAdmin && (
          <div className="pt-2 border-t border-[#eeedf7]">
            <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-amber-700 mb-2">
              Admin & Safety
            </p>
            <nav className="space-y-1">
              <button
                onClick={() => { navigateTo('admin'); onSelectTab?.('review'); }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isAdminRoute && activeTab === 'review' ? 'bg-amber-100/60 text-amber-900' : 'text-[#444653] hover:bg-amber-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Moderation Console</span>
              </button>
            </nav>
          </div>
        )}

      </div>
    </aside>
  );
};
