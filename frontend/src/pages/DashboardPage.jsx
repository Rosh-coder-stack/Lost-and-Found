import React, { useState } from 'react';
import { IMAGES } from '../data/mockData';

// Fallback images based on category
const CATEGORY_DEFAULT_IMAGES = {
  'Electronics': 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
  'Wallets & Bags': 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
  'Keys': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
  'Jewelry & Watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
  'Documents & IDs': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  'Clothing & Accessories': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  'Pets': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
  'Other': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
};

// Helper to format date / relative time
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function DashboardPage({ 
  userReports = [], 
  isLoadingReports = false,
  onOpenReport, 
  onOpenBrowse, 
  onSelectItem, 
  onOpenStories,
  onEditReport,
  onDeleteReport,
  user
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Normalize reports
  const normalizedReports = userReports.map((report) => {
    const id = report._id || report.id;
    const image = report.imageUrl || report.image || CATEGORY_DEFAULT_IMAGES[report.category] || CATEGORY_DEFAULT_IMAGES['Other'];
    const timeAgo = report.createdAt ? formatTimeAgo(report.createdAt) : (report.timeAgo || 'Recently');
    const statusType = report.statusType || (report.status === 'matched' ? 'match' : (report.status === 'resolved' || report.status === 'returned' || report.status === 'claimed' ? 'resolved' : 'searching'));
    const statusText = (report.status || 'SEARCHING').toUpperCase();

    return {
      ...report,
      id,
      image,
      timeAgo,
      statusType,
      status: statusText,
    };
  });

  // Filter user reports based on selected tab
  const filteredReports = normalizedReports.filter((report) => {
    if (activeTab === 'matches') return report.statusType === 'match' || report.status === 'MATCHED';
    if (activeTab === 'searching') return report.statusType === 'searching' || report.status === 'SEARCHING';
    return true;
  });

  const matchesCount = normalizedReports.filter((r) => r.statusType === 'match' || r.status === 'MATCHED').length;

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteReport) {
        await onDeleteReport(itemToDelete);
      }
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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
        {/* Left Column (8 cols): Reports & Filter */}
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
                  All ({normalizedReports.length})
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

            {/* Loading Skeleton */}
            {isLoadingReports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2].map((n) => (
                  <div key={n} className="glass-card rounded-2xl p-5 border border-white/5 animate-pulse space-y-4">
                    <div className="h-40 bg-white/5 rounded-xl"></div>
                    <div className="h-4 bg-white/10 rounded w-3/4"></div>
                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
                <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#d2bbff] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-3xl">inventory_2</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No reports found</h3>
                <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto mb-6">
                  {activeTab === 'all' 
                    ? "You haven't reported any lost items yet. Submit your first report to start tracking."
                    : "No reports currently matching this filter."}
                </p>
                <button
                  onClick={onOpenReport}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-md"
                >
                  Report Lost Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => onSelectItem && onSelectItem(report)}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-[#27272A] hover:border-[#7C3AED]/70 hover:shadow-[0_10px_30px_-10px_rgba(124,58,237,0.3)] transition-all duration-300 bg-[#131316]/80"
                  >
                    {/* Item Thumbnail */}
                    <div className="h-44 w-full bg-[#18181B] relative overflow-hidden">
                      <img
                        src={report.image}
                        alt={report.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = CATEGORY_DEFAULT_IMAGES[report.category] || CATEGORY_DEFAULT_IMAGES['Other'];
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131316] via-transparent to-transparent opacity-80"></div>
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        {report.statusType === 'match' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED] text-white shadow-lg border border-purple-400/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            {report.status}
                          </span>
                        ) : report.statusType === 'resolved' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
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
                        {report.location && (
                          <p className="text-[11px] text-[#958da1] mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] text-[#EC4899]">location_on</span>
                            <span className="line-clamp-1">{report.location}</span>
                          </p>
                        )}
                      </div>

                      {/* Actions & Footer */}
                      <div className="pt-3 border-t border-[#27272A] flex flex-col gap-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#71717A] text-[11px] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {report.timeAgo}
                          </span>
                          <span className="text-[#d2bbff] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                            Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                          </span>
                        </div>

                        {/* Owner Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEditReport) onEditReport(report);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#18181B] hover:bg-[#7C3AED]/20 border border-[#3F3F46] hover:border-[#7C3AED]/50 text-white hover:text-[#d2bbff] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Edit Report"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToDelete(report);
                            }}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-[#18181B] hover:bg-red-500/20 border border-[#3F3F46] hover:border-red-500/50 text-white hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            title="Delete Report"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column (4 cols): Live Discoveries & Safety */}
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
                  <p className="text-[11px] text-[#A1A1AA]">Real-time community recoveries</p>
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

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-red-500/30 bg-[#131316]/95 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white">
                  Delete Lost Report?
                </h3>
                <p className="text-xs text-[#A1A1AA]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#e5e1e4] leading-relaxed">
              Are you sure you want to permanently delete your report for{' '}
              <span className="text-white font-bold">"{itemToDelete.title}"</span>? It will be removed from your dashboard and the public search directory.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#18181B] border border-[#3F3F46] text-white font-bold text-xs hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
