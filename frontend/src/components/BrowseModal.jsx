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
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'lost' | 'found'

  if (!isOpen) return null;

  const filteredItems = items.filter((item) => {
    const titleMatch = item.title ? item.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const locationMatch = item.location ? item.location.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const descriptionMatch = item.description ? item.description.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    const matchesSearch = !searchTerm.trim() || titleMatch || locationMatch || descriptionMatch;

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    const itemType = item.type === 'found' ? 'found' : 'lost';
    const matchesType = selectedType === 'all' || itemType === selectedType;

    return matchesSearch && matchesCategory && matchesType;
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

        {/* Search Input, Type Switcher & Category Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#958da1] text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-12 pr-10 text-white placeholder:text-[#958da1]/60 focus:outline-none focus:border-[#7C3AED] text-sm"
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

            {/* Type Filter Buttons */}
            <div className="flex items-center p-1 bg-[#18181B] border border-[#3F3F46] rounded-xl gap-1">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('lost')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedType === 'lost'
                    ? 'bg-[#EC4899] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">search</span>
                Lost
              </button>
              <button
                onClick={() => setSelectedType('found')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedType === 'found'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-xs">volunteer_activism</span>
                Found
              </button>
            </div>
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
              const status = (item.status || 'SEARCHING').toUpperCase();
              const isFound = item.type === 'found';

              return (
                <div 
                  key={id}
                  onClick={() => onSelectItem(item)}
                  className="glass-card rounded-2xl overflow-hidden flex flex-col cursor-pointer group hover:border-[#7C3AED] transition-all bg-[#18181B]/70 border border-[#27272A]"
                >
                  <div className="h-44 w-full bg-[#0d0d10] relative overflow-hidden flex items-center justify-center border-b border-[#27272A]">
                    <img 
                      src={image} 
                      alt={item.title}
                      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
                      }}
                    />

                    {/* Top Left: Lost vs Found badge */}
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      {isFound ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/90 text-white shadow-md backdrop-blur-md">
                          <span className="material-symbols-outlined text-xs">volunteer_activism</span>
                          FOUND
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#EC4899]/90 text-white shadow-md backdrop-blur-md">
                          <span className="material-symbols-outlined text-xs">search</span>
                          LOST
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 z-10 pointer-events-none bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-lg border border-white/10">
                      {status}
                    </div>
                    <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                        {item.category || 'Belonging'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div>
                      <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-bold text-white text-base group-hover:text-[#d2bbff] transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-[11px] text-[#958da1]">
                      <span className="flex items-center gap-1 line-clamp-1 max-w-[160px]">
                        <span className="material-symbols-outlined text-[13px] text-[#EC4899]">location_on</span>
                        {item.location || 'Unknown'}
                      </span>
                      <span className="text-[#d2bbff] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center">
                        View <span className="material-symbols-outlined text-xs">arrow_forward</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-[#A1A1AA]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#7C3AED]/40">search_off</span>
              <p className="text-sm font-semibold text-white">No items found matching your criteria</p>
              <p className="text-xs text-[#958da1] mt-1">Try clearing your filters or changing search keywords</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
