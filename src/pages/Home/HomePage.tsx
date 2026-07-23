import React, { useState } from 'react';
import { useItems } from '../../context/ItemContext';
import { useNavigation } from '../../context/NavigationContext';
import { ItemCard } from '../../components/ui/ItemCard';
import { BoundingMapWidget } from '../../components/ui/BoundingMapWidget';
import { Modal } from '../../components/common/Modal';
import { ITEM_CATEGORIES } from '../../utils/constants';
import { Search, PlusCircle, AlertTriangle, ShieldCheck, ArrowRight, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { items, setFilterState, submitClaim } = useItems();
  const { navigateTo } = useNavigation();

  const [heroQuery, setHeroQuery] = useState('');
  const [claimModalItem, setClaimModalItem] = useState<any | null>(null);
  const [claimReason, setClaimReason] = useState('');

  const recentFoundItems = items.filter(i => i.type === 'found' && i.status === 'active').slice(0, 6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterState(prev => ({ ...prev, searchQuery: heroQuery }));
    navigateTo('search');
  };

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
    alert('Ownership claim submitted! Redirecting to your claims page...');
    navigateTo('profile');
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#00288e] via-[#1e40af] to-[#0f172a] text-white rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden shadow-xl">
        
        {/* Background Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Official Campus Lost & Found System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Misplaced something on campus? <br />
            <span className="text-amber-300">We'll help you find it.</span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100 max-w-2xl leading-relaxed">
            Search hundreds of verified items recovered across libraries, lecture halls, and recreation centers, or log a found item to reunite it with its student owner.
          </p>

          {/* Search Bar Bar */}
          <form onSubmit={handleHeroSearch} className="pt-2">
            <div className="bg-white p-2 rounded-2xl shadow-lg flex items-center space-x-2 max-w-2xl">
              <Search className="w-5 h-5 text-[#757684] ml-3 shrink-0" />
              <input
                type="text"
                value={heroQuery}
                onChange={(e) => setHeroQuery(e.target.value)}
                placeholder="Search MacBook, keys, Hydro Flask, AirPods, wallet..."
                className="w-full text-sm font-medium text-[#1a1b22] focus:outline-none px-2"
              />
              <button
                type="submit"
                className="bg-[#00288e] hover:bg-[#1e40af] text-white px-6 py-3 rounded-xl font-bold text-xs transition-colors shrink-0 flex items-center space-x-1"
              >
                <span>Search Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Quick Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('report-found')}
              className="bg-white text-[#00288e] px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors flex items-center space-x-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4 text-[#00288e]" />
              <span>I Found an Item</span>
            </button>
            <button
              onClick={() => navigateTo('report-lost')}
              className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-600 transition-colors flex items-center space-x-2 shadow-xs"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>I Lost an Item</span>
            </button>
          </div>

        </div>

      </section>

      {/* Category Quick Chips */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-[#1a1b22]">Explore by Category</h2>
          <button onClick={() => navigateTo('search')} className="text-xs font-bold text-[#00288e] hover:underline flex items-center space-x-1">
            <span>View Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {ITEM_CATEGORIES.slice(0, 5).map((cat) => (
            <div
              key={cat}
              onClick={() => {
                setFilterState(prev => ({ ...prev, category: cat as any }));
                navigateTo('search');
              }}
              className="bg-white p-4 rounded-2xl border border-[#e8e7f1] hover:border-[#00288e] hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-[#f4f2fc] group-hover:bg-[#00288e] text-[#00288e] group-hover:text-white flex items-center justify-center mb-2 transition-colors">
                <span className="material-symbols-outlined text-xl">
                  {cat === 'Electronics' ? 'laptop_mac' : cat === 'Keys & Cards' ? 'key' : cat === 'Eyewear' ? 'eyeglasses' : cat === 'Bottles & Containers' ? 'water_bottle' : 'headphones'}
                </span>
              </div>
              <p className="font-bold text-xs text-[#1a1b22] group-hover:text-[#00288e]">{cat}</p>
              <p className="text-[10px] text-[#757684] mt-0.5">Active items listed</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Found Items Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eeedf7] pb-4">
          <div>
            <h2 className="text-xl font-black text-[#1a1b22]">Recently Found Valuables</h2>
            <p className="text-xs text-[#757684]">Recovered on campus and waiting for verified student claims</p>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="px-4 py-2 rounded-xl bg-[#eeedf7] text-[#00288e] hover:bg-[#00288e] hover:text-white font-bold text-xs transition-colors self-start sm:self-auto"
          >
            Browse All {items.length} Items
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentFoundItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClaimClick={(itm) => setClaimModalItem(itm)}
            />
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-white border-y border-[#e8e7f1] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-black text-[#1a1b22]">How Campus Lost & Found Works</h2>
            <p className="text-xs text-[#757684]">A simple 3-step process to return property safely with zero hassle</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#f4f2fc] border border-[#e8e7f1] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00288e] text-white flex items-center justify-center mx-auto font-black text-lg shadow-xs">
                1
              </div>
              <h3 className="font-bold text-base text-[#1a1b22]">Report or Discover</h3>
              <p className="text-xs text-[#505f76] leading-relaxed">
                Report a lost item or log property you found near library desks, lecture halls, or athletic facilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f4f2fc] border border-[#e8e7f1] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00288e] text-white flex items-center justify-center mx-auto font-black text-lg shadow-xs">
                2
              </div>
              <h3 className="font-bold text-base text-[#1a1b22]">Submit Ownership Proof</h3>
              <p className="text-xs text-[#505f76] leading-relaxed">
                Verify ownership by answering unique security details, photo screenshots, or lock screen passcode checks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f4f2fc] border border-[#e8e7f1] text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00288e] text-white flex items-center justify-center mx-auto font-black text-lg shadow-xs">
                3
              </div>
              <h3 className="font-bold text-base text-[#1a1b22]">Safe Pickup Hub</h3>
              <p className="text-xs text-[#505f76] leading-relaxed">
                Collect your verified item at the Student Union Lost & Found desk or campus security dispatch center.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Campus Map Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="lg:col-span-1 space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-[#00288e] px-3 py-1 rounded-full text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Campus Geo Coverage</span>
          </div>
          <h2 className="text-2xl font-black text-[#1a1b22]">Interactive Campus Retrieval Network</h2>
          <p className="text-xs text-[#505f76] leading-relaxed">
            Every reported lost or found item is pinned to an official campus building location. Check hot zones across MLK Union, Moffitt Library, and Science Complex.
          </p>
          <div className="space-y-2 text-xs font-medium text-[#1a1b22]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-time building drop-off monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Secure lockbox tracking for electronic valuables</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('search')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-[#00288e] text-white font-bold text-xs hover:bg-[#1e40af] transition-colors"
          >
            Explore Map Catalog
          </button>
        </div>

        <div className="lg:col-span-2">
          <BoundingMapWidget />
        </div>
      </section>

      {/* Quick Claim Modal */}
      {claimModalItem && (
        <Modal
          isOpen={!!claimModalItem}
          onClose={() => setClaimModalItem(null)}
          title={`Submit Claim for ${claimModalItem.title}`}
        >
          <form onSubmit={handleQuickClaimSubmit} className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-[#f4f2fc] rounded-xl border border-[#e8e7f1]">
              <img src={claimModalItem.imageUrl} alt={claimModalItem.title} className="w-16 h-16 object-cover rounded-lg" />
              <div>
                <p className="font-bold text-xs text-[#1a1b22]">{claimModalItem.title}</p>
                <p className="text-[10px] text-[#757684]">Found at {claimModalItem.location.building}</p>
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
                placeholder="Mention device lock screen wallpaper, Bluetooth name, unique stickers, or exact serial numbers..."
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
                Submit Claim Verification
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
