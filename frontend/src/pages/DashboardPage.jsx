import React, { useState } from 'react';
import { IMAGES } from '../data/mockData';

export default function DashboardPage({ 
  userReports = [], 
  suggestedItems = [], 
  onOpenReport, 
  onOpenBrowse, 
  onSelectItem, 
  onOpenStories,
  user
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  // Extract only the first name and capitalize nicely
  const getFirstName = (name) => {
    if (!name || typeof name !== 'string') return 'Friend';
    const cleanName = name.trim().split(/\s+/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  };

  const greeting = getGreeting();
  const firstName = getFirstName(user?.name);

  // Filter user reports based on selected tab
  const filteredReports = userReports.filter((report) => {
    if (activeTab === 'matches') return report.statusType === 'match';
    if (activeTab === 'searching') return report.statusType === 'searching';
    return true;
  });

  const matchesCount = userReports.filter((r) => r.statusType === 'match').length;

  return (
    <div className="pt-28 pb-20 max-w-[1280px] mx-auto px-6 font-['Inter',sans-serif]">
      {/* Top Header & Welcome */}
      <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#d2bbff] text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-pulse"></span>
            Lost & Found Command Center
          </div>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-[#d2bbff] via-[#f4d4e3] to-[#ffb0cd] bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#A1A1AA] mt-1 max-w-xl">
            Track your reported belongings, live visual matches, and community recoveries.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenReport}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-sm primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Report Lost Item
          </button>
          <button
            onClick={onOpenBrowse}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#18181B] border border-[#3F3F46] hover:border-[#7C3AED] text-white font-bold text-sm hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg text-[#d2bbff]">search</span>
            Browse Found Items
          </button>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Reports & Suggestions */}
        <div className="lg:col-span-8 space-y-10">
          {/* Active Reports Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white tracking-tight">
                  Your Reports
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Items you have registered as lost or missing
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#18181B] border border-[#27272A] rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  All ({userReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'matches'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Matches ({matchesCount})
                </button>
                <button
                  onClick={() => setActiveTab('searching')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'searching'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Searching
                </button>
              </div>
            </div>

            {/* Reports Grid */}
            {filteredReports.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#d2bbff] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No items in this filter</h3>
                <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto mb-6">
                  You haven't reported any lost items matching this filter yet.
                </p>
                <button
                  onClick={onOpenReport}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold cursor-pointer hover:bg-[#6D28D9] transition-all"
                >
                  Create a Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => onSelectItem(report)}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-[#27272A] hover:border-[#7C3AED]/70 hover:shadow-[0_10px_30px_-10px_rgba(124,58,237,0.3)] transition-all duration-300 bg-[#131316]/80"
                  >
                    {/* Item Thumbnail */}
                    <div className="h-44 w-full bg-[#18181B] relative overflow-hidden">
                      <img
                        src={report.image}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131316] via-transparent to-transparent opacity-80"></div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {report.statusType === 'match' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED] text-white shadow-lg border border-purple-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            {report.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#18181B]/90 text-[#d2bbff] border border-[#3F3F46]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d2bbff] animate-pulse"></span>
                            {report.status}
                          </span>
                        )}
                      </div>

                      {/* Category Chip */}
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                          {report.category || 'Belonging'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                      <div>
                        <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white group-hover:text-[#d2bbff] transition-colors line-clamp-1">
                          {report.title}
                        </h3>
                        <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-[#27272A] text-xs">
                        <span className="text-[#71717A] text-[11px] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">schedule</span>
                          {report.timeAgo}
                        </span>
                        <span className="text-[#d2bbff] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Inspect <span className="material-symbols-outlined text-xs">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 cols): Live Feed & Safety Tips */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Community Discoveries Feed */}
          <div className="glass-card rounded-2xl p-6 border border-[#27272A] bg-[#131316]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center text-[#d2bbff]">
                  <span className="material-symbols-outlined text-lg">celebration</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold text-white">
                    Live Discoveries
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA]">Real-time community reunions</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Story 1 */}
              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.sarahAvatar}
                  alt="Sarah"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#7C3AED]/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Sarah J.</p>
                    <span className="text-[10px] text-[#71717A]">2m ago</span>
                  </div>
                  <p className="text-xs text-[#d2bbff] font-semibold mt-0.5">
                    Apartment Keys Recovered
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Returned by a kind neighbor via FoundIt within minutes!"
                  </p>
                </div>
              </div>

              {/* Story 2 */}
              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.markAvatar}
                  alt="Mark"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#EC4899]/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Mark T.</p>
                    <span className="text-[10px] text-[#71717A]">45m ago</span>
                  </div>
                  <p className="text-xs text-[#ffb0cd] font-semibold mt-0.5">
                    Sony Camera Reunited
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Found and matched with zero hassle. Truly incredible service."
                  </p>
                </div>
              </div>

              {/* Story 3 */}
              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.elenaAvatar}
                  alt="Elena"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-emerald-500/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Elena R.</p>
                    <span className="text-[10px] text-[#71717A]">2h ago</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Lost Puppy Safely Returned
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Bella is back home! Thank you to the entire community."
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenStories}
              className="w-full mt-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#e5e1e4] hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-[#d2bbff]">auto_stories</span>
              View Success Wall
            </button>
          </div>

          {/* Safe Recovery Guidelines Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#121215] border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">shield</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold text-white">
                Safe Recovery Protocol
              </h4>
            </div>
            
            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
              Always verify ownership proof before meeting. For handoffs, choose well-lit public spots or local precinct safe zones.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              100% Encrypted Messaging & Privacy
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
