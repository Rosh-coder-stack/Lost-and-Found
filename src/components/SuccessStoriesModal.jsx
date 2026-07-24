import React from 'react';
import { COMMUNITY_STORIES } from '../data/mockData';

export default function SuccessStoriesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-2xl rounded-2xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-[#353437] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-[#7C3AED] text-3xl">groups</span>
          <div>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
              Community Success Stories
            </h2>
            <p className="text-[#A1A1AA] text-sm">
              Real reunions made possible by FoundIt AI matching and community trust.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {COMMUNITY_STORIES.map((story) => (
            <div key={story.id} className="glass-card p-5 rounded-xl border border-[#3F3F46] flex gap-4 items-start">
              <img 
                src={story.avatar} 
                alt={story.name} 
                className="w-12 h-12 rounded-full object-cover border-2 border-[#7C3AED]/40 flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white text-base">
                    {story.name} <span className="font-normal text-[#ccc3d8]">{story.action}</span>
                  </h4>
                </div>
                <p className="text-sm italic text-[#A1A1AA] mt-1 bg-[#18181B] p-3 rounded-lg border border-[#3F3F46]/50">
                  {story.quote}
                </p>
                <p className="text-[11px] font-bold text-[#d2bbff] mt-2 uppercase tracking-wider">
                  {story.timeLocation}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl border border-[#3F3F46] text-[#e5e1e4] font-bold text-sm hover:bg-[#353437] transition-all cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
