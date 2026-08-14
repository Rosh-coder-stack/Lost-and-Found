import React, { useState } from 'react';

const CATEGORIES = [
  'All',
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Jewelry & Watches',
  'Documents & IDs',
  'Clothing & Accessories',
  'Pets',
  'Other',
];

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

export default function BrowseModal({ isOpen, onClose, items = [], onSelectItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const titleMatch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const locationMatch = item.location ? item.location.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descriptionMatch = item.description ? item.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = !searchTerm.trim() || titleMatch || locationMatch || descriptionMatch;

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Inter',sans-serif]">
      <div className="glass-card w-full max-w-4xl rounded-3xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[88vh] flex flex-col bg-[#131316]/95 shadow-2xl">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#d2bbff] text-2xl">grid_view</span>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl md:text-3xl font-bold text-white tracking-tight">
              Global Search & Lost/Found Items
            </h2>
          </div>
          <p className="text-[#A1A1AA] text-sm">
            Browse through active reports and recovered items indexed across our community.
          </p>
        </div>

        {/* Search Input & Category Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#958da1] text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search by title, location, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3.5 pl-12 pr-10 text-white placeholder:text-[#958da1]/60 focus:outline-none focus:border-[#7C3AED] text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#958da1] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">clear</span>
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'bg-[#201f22] border border-[#3F3F46] text-[#A1A1AA] hover:text-white hover:border-[#7C3AED]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const id = item._id || item.id;
              const image = item.imageUrl || item.image || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
              const status = (item.status || item.type || 'REPORTED').toUpperCase();

              return (
                <div 
                  key={id}
                  onClick={() => onSelectItem(item)}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer group hover:border-[#7C3AED] transition-all bg-[#18181B]/70 border border-[#27272A]"
                >
                  <div className="h-36 w-full bg-[#201f22] relative overflow-hidden">
                    <img 
                      src={image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
                      }}
                    />
                    <div className="absolute top-3 right-3 bg-[#7c3aed] text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg border border-white/10">
                      {status}
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                        {item.category || 'Belonging'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-base mb-1 group-hover:text-[#d2bbff] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    {item.location && (
                      <p className="text-[#A1A1AA] text-xs mb-2 flex items-center gap-1 line-clamp-1">
                        <span className="material-symbols-outlined text-xs text-[#EC4899]">location_on</span>
                        {item.location}
                      </p>
                    )}
                    <p className="text-[#ccc3d8] text-xs line-clamp-2 mb-3 flex-1 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-[#A1A1AA] pt-2 border-t border-[#3F3F46]/50">
                      <span>{item.timeAgo || item.date || 'Recent'}</span>
                      <span className="text-[#d2bbff] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        View Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-[#A1A1AA]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#3F3F46]">search_off</span>
              <p className="text-base font-semibold text-white">No items found matching your filter</p>
              <p className="text-xs mt-1">Try searching for keywords like "Keys", "Wallet", "Sony", or "MacBook"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

