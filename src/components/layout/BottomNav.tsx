import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { RoutePage } from '../../types';
import { Home, Search, PlusCircle, SlidersHorizontal, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeRoute, navigateTo } = useNavigation();

  const navs: { route: RoutePage; label: string; icon: React.ReactNode }[] = [
    { route: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { route: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { route: 'report-found', label: 'Report', icon: <PlusCircle className="w-5 h-5" /> },
    { route: 'dashboard', label: 'Dashboard', icon: <SlidersHorizontal className="w-5 h-5" /> },
    { route: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8e7f1] px-2 py-1 flex items-center justify-around shadow-lg">
      {navs.map((item) => {
        const isActive = activeRoute === item.route;
        return (
          <button
            key={item.route}
            onClick={() => navigateTo(item.route)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
              isActive ? 'text-[#00288e] font-bold' : 'text-[#757684]'
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
