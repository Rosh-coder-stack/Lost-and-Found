import React, { useState } from 'react';
import { useItems } from '../../context/ItemContext';
import { SearchFilters } from '../../components/forms/SearchFilters';
import { ItemCard } from '../../components/ui/ItemCard';
import { Modal } from '../../components/common/Modal';
import { Search, SlidersHorizontal, PackageX, Sparkles } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { filteredItems, filterState, submitClaim } = useItems();
  const [claimModalItem, setClaimModalItem] = useState<any | null>(null);
  const [claimReason, setClaimReason] = useState('');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const handleQuickClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimModalItem) return;
    submitClaim({
      itemId: claimModalItem.id,
      itemTitle: claimModalItem.title,
      itemImage: claimModalItem.imageUrl,
      claimerId: 'usr_john',
      claimerName: 'John Doe',
      claimerEmail: 'j.doe@university.edu',
      claimerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBALmeD0jHHqe-FvAIiC58dL06wTpxK6YRImjPnZRNj6IjKH-qBiQFPU7S0ceXP7m0AjjXdXrgikGKYwOdejbRzSpx05rOH2DKkkLgVAGbNbhRgwd_OOQveKikEIX21jAQp9v24GxI7-Xe-Irvk84T4O_1aSKG7fFeN35oQmsUEoNXLFhAqKKyrwlDWPOF7yj46gnBM4kGb6mTAGmgoo-3K0b9oJPzasjFRuVUoK-vpJ4d6US7X42c3Zc6i0g6XqCxtZwInOnhwKT0',
      descriptionOfOwnership: claimReason,
    });
    setClaimModalItem(null);
    setClaimReason('');
    alert('Ownership claim request logged successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eeedf7] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#1a1b22]">Campus Catalog & Search</h1>
          <p className="text-xs text-[#757684]">Browse {filteredItems.length} active lost and found items across university locations</p>
        </div>

        {/* Mobile Filter Drawer Button */}
        <button
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="lg:hidden px-4 py-2 bg-white border border-[#e8e7f1] rounded-xl text-xs font-bold text-[#1a1b22] flex items-center space-x-2 self-start"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00288e]" />
          <span>Filter Items ({filterState.type})</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filter Panel */}
        <div className={`w-full lg:w-72 shrink-0 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <SearchFilters />
        </div>

        {/* Main Item Grid */}
        <div className="flex-1 space-y-6">
          
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#e8e7f1] p-12 text-center space-y-3">
              <PackageX className="w-12 h-12 text-[#757684] mx-auto" />
              <h3 className="font-bold text-base text-[#1a1b22]">No Matching Items Found</h3>
              <p className="text-xs text-[#505f76] max-w-sm mx-auto">
                Try loosening your search filters or check back later. New items are turned in daily to campus security.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClaimClick={(itm) => setClaimModalItem(itm)}
                />
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Claim Request Modal */}
      {claimModalItem && (
        <Modal
          isOpen={!!claimModalItem}
          onClose={() => setClaimModalItem(null)}
          title={`Claim ${claimModalItem.title}`}
        >
          <form onSubmit={handleQuickClaimSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-[#f4f2fc] rounded-xl border border-[#e8e7f1]">
              <img src={claimModalItem.imageUrl} alt={claimModalItem.title} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="font-bold text-xs text-[#1a1b22]">{claimModalItem.title}</p>
                <p className="text-[10px] text-[#757684]">Location: {claimModalItem.location.building}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Describe Proof of Ownership <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                placeholder="Details only the true owner would know (passcode check, distinct stickers, Bluetooth name, exact items inside bag...)"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setClaimModalItem(null)}
                className="px-4 py-2 rounded-xl border border-[#e8e7f1] text-xs font-semibold text-[#444653]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00288e] text-white text-xs font-bold rounded-xl hover:bg-[#1e40af]"
              >
                Submit Ownership Proof
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
