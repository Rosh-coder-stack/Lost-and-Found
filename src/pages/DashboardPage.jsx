import React from 'react';
import { IMAGES } from '../data/mockData';

export default function DashboardPage({ 
  userReports, 
  suggestedItems, 
  onOpenReport, 
  onOpenBrowse, 
  onSelectItem, 
  onOpenStories,
  user
}) {
  const userName = user?.name || 'Alex';

  return (
    <div className="pt-28 pb-20 max-w-[1280px] mx-auto px-6">
      {/* Welcome Header */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              Welcome back, {userName}!
            </h1>
            <p className="font-['Inter'] text-base md:text-lg text-[#A1A1AA]">
              You have <span className="text-[#d2bbff] font-semibold">2 items found</span> and{' '}
              <span className="text-[#ffb0cd] font-semibold">1 report active</span> today.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4 shadow-md">
              <div className="w-12 h-12 rounded-full bg-[#d2bbff]/10 flex items-center justify-center text-[#d2bbff]">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  Recent Alert
                </p>
                <p className="text-sm font-semibold text-white">
                  Match found in Seattle
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <button
          onClick={onOpenReport}
          className="primary-gradient p-8 rounded-2xl flex items-center justify-between group text-left cursor-pointer transition-all duration-300 shadow-xl hover:scale-[1.01]"
        >
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white mb-2">
              Report Lost Item
            </h3>
            <p className="text-white/80 text-sm">
              Create a new record to start searching the database.
            </p>
          </div>
          <span className="material-symbols-outlined text-white text-4xl group-hover:translate-x-2 transition-transform">
            add_circle
          </span>
        </button>

        <button
          onClick={onOpenBrowse}
          className="glass-card p-8 rounded-2xl flex items-center justify-between group text-left cursor-pointer transition-all duration-300 shadow-xl hover:border-[#7C3AED]"
        >
          <div>
            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white mb-2">
              Search Database
            </h3>
            <p className="text-[#A1A1AA] text-sm">
              Browse millions of reported found items globally.
            </p>
          </div>
          <span className="material-symbols-outlined text-[#d2bbff] text-4xl group-hover:scale-110 transition-transform">
            search
          </span>
        </button>
      </section>

      {/* Grid Layout: Left Content & Right Feed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Active Reports & Matches */}
        <div className="lg:col-span-8 space-y-12">
          {/* Active Reports */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
                Active Reports
              </h2>
              <button 
                onClick={onOpenBrowse}
                className="text-[#d2bbff] font-semibold text-sm hover:underline cursor-pointer"
              >
                View all reports
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => onSelectItem(report)}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer hover:border-[#7C3AED] transition-all"
                >
                  <div className="h-48 w-full bg-[#353437] relative overflow-hidden">
                    <img
                      src={report.image}
                      alt={report.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      report.statusType === 'match'
                        ? 'bg-[#7c3aed] text-[#ede0ff]'
                        : 'bg-[#2a2a2c] text-[#ccc3d8] border border-[#3F3F46]'
                    }`}>
                      {report.status}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white mb-1 group-hover:text-[#d2bbff] transition-colors">
                      {report.title}
                    </h4>
                    <p className="text-[#A1A1AA] text-xs mb-4 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#7C3AED]">location_on</span>
                      {report.location}
                    </p>

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-[#3F3F46]/40 text-xs">
                      <span className="text-[#A1A1AA] italic">{report.timeAgo}</span>
                      <button className="text-[#d2bbff] font-bold flex items-center gap-0.5 cursor-pointer">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Suggested for You */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
                Suggested for You
              </h2>
              <span className="text-[#A1A1AA] text-xs font-medium">Based on your location</span>
            </div>

            <div className="space-y-4">
              {suggestedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="glass-card p-4 rounded-2xl flex items-center gap-5 group cursor-pointer hover:bg-[#1c1b1d] transition-all"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#353437]">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-base truncate">{item.title}</h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded whitespace-nowrap ${
                        item.badgeType === 'match'
                          ? 'text-[#d2bbff] bg-[#d2bbff]/10'
                          : 'text-[#ffb0cd] bg-[#ffb0cd]/10'
                      }`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[#A1A1AA] text-xs mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <span className="material-symbols-outlined text-[#A1A1AA] group-hover:text-[#d2bbff] transition-colors">
                    chevron_right
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Community Feed & Upgrade */}
        <aside className="lg:col-span-4 space-y-8">
          {/* Community Feed */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-[#d2bbff]">groups</span>
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-white">
                Community Feed
              </h3>
            </div>

            <div className="space-y-6">
              {/* Feed Item 1 */}
              <div className="flex gap-4">
                <img
                  src={IMAGES.sarahAvatar}
                  alt="Sarah J"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#7C3AED]/30"
                />
                <div>
                  <p className="text-sm text-[#e5e1e4]">
                    <span className="font-bold">Sarah J.</span> just found her lost apartment keys!
                  </p>
                  <p className="text-[#A1A1AA] text-xs mt-1">
                    "Thank you FoundIt community for helping me get home safely."
                  </p>
                  <p className="text-[#d2bbff] text-[10px] font-bold mt-2 uppercase tracking-wider">
                    2m ago • Seattle, WA
                  </p>
                </div>
              </div>

              {/* Feed Item 2 */}
              <div className="flex gap-4">
                <img
                  src={IMAGES.markAvatar}
                  alt="Mark T"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#7C3AED]/30"
                />
                <div>
                  <p className="text-sm text-[#e5e1e4]">
                    <span className="font-bold">Mark T.</span> reunited with his digital camera.
                  </p>
                  <p className="text-[#A1A1AA] text-xs mt-1">
                    "A kind stranger posted it within 1 hour of me losing it."
                  </p>
                  <p className="text-[#d2bbff] text-[10px] font-bold mt-2 uppercase tracking-wider">
                    1h ago • Brooklyn, NY
                  </p>
                </div>
              </div>

              {/* Feed Item 3 */}
              <div className="flex gap-4">
                <img
                  src={IMAGES.elenaAvatar}
                  alt="Elena R"
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-[#7C3AED]/30"
                />
                <div>
                  <p className="text-sm text-[#e5e1e4]">
                    <span className="font-bold">Elena R.</span> returned a lost Golden Retriever.
                  </p>
                  <p className="text-[#A1A1AA] text-xs mt-1">
                    "Happy to help bring Bella back to her family!"
                  </p>
                  <p className="text-[#d2bbff] text-[10px] font-bold mt-2 uppercase tracking-wider">
                    3h ago • Austin, TX
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenStories}
              className="w-full mt-8 py-3 rounded-xl border border-[#3F3F46] text-[#ccc3d8] text-sm font-semibold hover:bg-[#353437] transition-colors cursor-pointer"
            >
              View All Success Stories
            </button>
          </div>

          {/* Premium Pro Upgrade Card */}
          <div className="primary-gradient rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-lg hover:scale-[1.01] transition-transform">
            <div className="relative z-10">
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold mb-2">
                Upgrade to FoundIt Pro
              </h4>
              <p className="text-xs text-white/80 mb-4 leading-relaxed">
                Get instant SMS alerts and AI-powered visual matching for your items.
              </p>
              <span className="inline-block px-4 py-2 bg-white text-[#7C3AED] font-bold rounded-xl text-xs shadow">
                Learn More
              </span>
            </div>
            <span 
              className="material-symbols-filled absolute -bottom-4 -right-4 text-8xl text-white/10 group-hover:scale-110 transition-transform pointer-events-none"
            >
              workspace_premium
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
