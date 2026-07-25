import React, { useState } from 'react';

export default function ItemDetailsModal({ item, onClose, onClaimItem }) {
  const [claimMessage, setClaimMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const handleClaim = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onClaimItem) onClaimItem(item, claimMessage);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-xl rounded-2xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-[#353437] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff] text-xs font-bold uppercase">
            {item.status || item.badge || 'ITEM DETAILS'}
          </div>
          <span className="text-xs text-[#A1A1AA]">{item.category || 'General'}</span>
        </div>

        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white mb-2">
          {item.title}
        </h2>

        <p className="text-[#A1A1AA] text-sm flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-base text-[#7C3AED]">location_on</span>
          {item.location}
        </p>

        {/* Item Image */}
        <div className="w-full h-56 rounded-xl overflow-hidden bg-[#353437] mb-6 relative">
          <img 
            src={item.image} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Item Description */}
        <div className="bg-[#18181B] border border-[#3F3F46] rounded-xl p-4 mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] mb-2">Description & Notes</h4>
          <p className="text-sm text-[#e5e1e4] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Claim / Connect Form */}
        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
            <div>
              <p className="font-bold">Claim Verification Request Sent!</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Our automated verification agent has routed your request. You will receive an update in your dashboard.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                Is this your item or do you have information?
              </label>
              <textarea
                rows="2"
                required
                placeholder="Describe proof of ownership (e.g. serial number, contents inside, unique marks)..."
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#3F3F46] text-[#e5e1e4] font-bold text-sm hover:bg-[#353437] transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-sm primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">verified_user</span>
                Verify & Claim Item
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
