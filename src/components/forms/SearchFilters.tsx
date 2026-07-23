import React from 'react';
import { useItems } from '../../context/ItemContext';
import { ITEM_CATEGORIES, CAMPUS_BUILDINGS } from '../../utils/constants';
import { FilterState, ItemCategory } from '../../types';
import { Search, RotateCcw, Filter, MapPin, Tag, Calendar, Layers } from 'lucide-react';

export const SearchFilters: React.FC = () => {
  const { filterState, setFilterState, resetFilters } = useItems();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleTypeChange = (type: FilterState['type']) => {
    setFilterState(prev => ({ ...prev, type }));
  };

  const handleCategoryChange = (category: FilterState['category']) => {
    setFilterState(prev => ({ ...prev, category }));
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState(prev => ({ ...prev, campusZone: e.target.value }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#00288e]" />
          <h3 className="font-bold text-sm text-[#1a1b22]">Filter & Search</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-[#00288e] hover:underline font-semibold flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="block text-xs font-bold text-[#444653] uppercase mb-1.5">Search Keywords</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search laptop, wallet, keys, building..."
            className="w-full pl-9 pr-3 py-2 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e] transition-all"
          />
        </div>
      </div>

      {/* Status Type Toggle Pills */}
      <div>
        <label className="block text-xs font-bold text-[#444653] uppercase mb-1.5">Item Type</label>
        <div className="grid grid-cols-3 gap-1 bg-[#f4f2fc] p-1 rounded-xl border border-[#e8e7f1]">
          {(['all', 'found', 'lost'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                filterState.type === t
                  ? 'bg-[#00288e] text-white shadow-xs'
                  : 'text-[#505f76] hover:text-[#00288e]'
              }`}
            >
              {t === 'all' ? 'All Items' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Category List Checkboxes / Radio */}
      <div>
        <label className="block text-xs font-bold text-[#444653] uppercase mb-2 flex items-center justify-between">
          <span>Categories</span>
          <Tag className="w-3.5 h-3.5 text-[#757684]" />
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
              filterState.category === 'all' ? 'bg-[#eeedf7] text-[#00288e]' : 'text-[#444653] hover:bg-[#f4f2fc]'
            }`}
          >
            <span>All Categories</span>
            {filterState.category === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#00288e]"></span>}
          </button>
          {ITEM_CATEGORIES.map((cat) => {
            const isSelected = filterState.category === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat as ItemCategory)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                  isSelected ? 'bg-[#eeedf7] text-[#00288e] font-bold' : 'text-[#505f76] hover:bg-[#f4f2fc]'
                }`}
              >
                <span>{cat}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00288e]"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campus Zone Select */}
      <div>
        <label className="block text-xs font-bold text-[#444653] uppercase mb-1.5 flex items-center space-x-1">
          <MapPin className="w-3.5 h-3.5 text-[#00288e]" />
          <span>Campus Zone</span>
        </label>
        <select
          value={filterState.campusZone}
          onChange={handleZoneChange}
          className="w-full px-3 py-2 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium text-[#1a1b22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]"
        >
          <option value="all">All Campus Zones</option>
          <option value="Library Complex">Library Complex</option>
          <option value="Central Quad">Central Quad</option>
          <option value="Student Union">Student Union</option>
          <option value="Science & Engineering">Science & Engineering</option>
          <option value="South Campus">South Campus</option>
          <option value="Athletic Center">Athletic Center</option>
        </select>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-bold text-[#444653] uppercase mb-1.5 flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5 text-[#00288e]" />
          <span>Sort Order</span>
        </label>
        <select
          value={filterState.sortBy}
          onChange={handleSortChange}
          className="w-full px-3 py-2 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium text-[#1a1b22] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00288e]"
        >
          <option value="newest">Most Recent First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

    </div>
  );
};
