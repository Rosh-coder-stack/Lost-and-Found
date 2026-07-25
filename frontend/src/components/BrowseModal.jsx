import React, { useState } from 'react';

export default function BrowseModal({ isOpen, onClose, items, onSelectItem }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', 'Electronics', 'Wallets & Bags', 'Keys', 'Accessories', 'Pets'];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-4xl rounded-2xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[88vh] flex flex-col">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-[#353437] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-[#d2bbff] text-2xl">grid_view</span>
            <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
              Global Search & Found Items
            </h2>
          </div>
          <p className="text-[#A1A1AA] text-sm">
            Browse through recovered items indexed by our global community and AI scanner.
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
              className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-[#958da1]/60 focus:outline-none focus:border-[#7C3AED] text-sm"
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
            {categories.map((cat) => (
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
            filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="glass-card rounded-xl overflow-hidden flex flex-col cursor-pointer group hover:border-[#7C3AED] transition-all"
              >
                <div className="h-36 w-full bg-[#353437] relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-[#7c3aed] text-[#ede0ff] px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow">
                    {item.status || 'FOUND'}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-['Plus_Jakarta_Sans',sans-serif] font-semibold text-white text-base mb-1 group-hover:text-[#d2bbff] transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[#A1A1AA] text-xs mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {item.location}
                  </p>
                  <p className="text-[#ccc3d8] text-xs line-clamp-2 mb-3 flex-1">
                    {item.description}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-[#A1A1AA] pt-2 border-t border-[#3F3F46]/50">
                    <span>{item.timeAgo || item.date || 'Recent'}</span>
                    <span className="text-[#d2bbff] font-bold flex items-center gap-0.5">
                      View <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-[#A1A1AA]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#3F3F46]">search_off</span>
              <p className="text-base font-semibold text-white">No items found matching your filter</p>
              <p className="text-xs mt-1">Try searching for keywords like "Keys", "Wallet", "Seattle", or "MacBook"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
