import React, { useState } from 'react';

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

export default function ItemDetailsModal({
  item,
  onClose,
  onClaimItem,
  currentUser = null,
  onEditItem = null,
  onDeleteItem = null,
}) {
  const [claimMessage, setClaimMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!item) return null;

  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId && item.userId && (currentUserId.toString() === item.userId.toString());

  const image = item.imageUrl || item.image || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];

  const handleClaim = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      if (onClaimItem) onClaimItem(item, claimMessage);
    }, 1200);
  };

  const isFound = item.type === 'found';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Inter',sans-serif]">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[90vh] overflow-y-auto bg-[#131316]/95 shadow-2xl space-y-5">
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Lost vs Found Badge */}
          {isFound ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">volunteer_activism</span>
              Found Item
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#EC4899]/20 border border-[#EC4899]/40 text-[#ffb0cd] text-xs font-bold uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">search</span>
              Lost Item
            </span>
          )}

          <div className="px-3 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff] text-xs font-bold uppercase">
            {item.status || 'REPORTED'}
          </div>

          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#A1A1AA]">
            {item.category || 'Belonging'}
          </span>

          {isOwner && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">verified_user</span>
              Your Report
            </span>
          )}
        </div>

        <div>
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white tracking-tight">
            {item.title}
          </h2>
          {item.location && (
            <p className="text-[#A1A1AA] text-xs flex items-center gap-1.5 mt-1.5">
              <span className={`material-symbols-outlined text-sm ${isFound ? 'text-emerald-400' : 'text-[#EC4899]'}`}>
                location_on
              </span>
              <span>{isFound ? 'Discovered at:' : 'Last seen at:'} <strong className="text-white">{item.location}</strong></span>
            </p>
          )}
        </div>

        {/* Item Image */}
        <div className="w-full h-56 rounded-2xl overflow-hidden bg-[#201f22] relative">
          <img 
            src={image} 
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
            }}
          />
        </div>

        {/* Item Description */}
        <div className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
            {isFound ? 'Found Circumstances & Details' : 'Description & Circumstances'}
          </h4>
          <p className="text-sm text-[#e5e1e4] leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Distinguishing Details if present */}
        {item.distinguishingDetails && (
          <div className="bg-[#18181B] border border-[#3F3F46] rounded-2xl p-4 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#d2bbff] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">{isFound ? 'security' : 'fingerprint'}</span>
              {isFound ? 'Safekeeping & Marks' : 'Distinguishing Features'}
            </h4>
            <p className="text-xs text-[#ccc3d8] leading-relaxed">
              {item.distinguishingDetails}
            </p>
          </div>
        )}

        {/* Reporter information snapshot if available */}
        {item.reporterName && (
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1">
            <span>Reported by: <span className="text-white font-medium">{item.reporterName}</span></span>
            <span>{isFound ? 'Date Found:' : 'Date Lost:'} <span className="text-white">{item.dateLost ? new Date(item.dateLost).toLocaleDateString() : (item.timeAgo || 'Recently')}</span></span>
          </div>
        )}

        {/* Owner Controls OR Claim Form */}
        {isOwner ? (
          <div className="pt-2 flex gap-3 border-t border-[#27272A]">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEditItem) onEditItem(item);
              }}
              className="flex-1 py-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/50 hover:bg-[#7C3AED]/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Report
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onDeleteItem) onDeleteItem(item);
              }}
              className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete Report
            </button>
          </div>
        ) : submitted ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-400">check_circle</span>
            <div>
              <p className="font-bold">Claim Verification Request Sent!</p>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                Our verification router has queued your claim request for this item.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleClaim} className="space-y-4 pt-1 border-t border-[#27272A]">
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
                className="flex-1 py-3 rounded-xl border border-[#3F3F46] text-[#e5e1e4] font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
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

