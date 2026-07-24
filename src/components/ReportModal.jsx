import React, { useState } from 'react';

export default function ReportModal({ isOpen, onClose, onSubmitReport }) {
  const [reportType, setReportType] = useState('lost'); // 'lost' or 'found'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !location) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newReport = {
        id: `rep-${Date.now()}`,
        title: title,
        location: location,
        timeAgo: 'Just now',
        status: reportType === 'lost' ? 'SEARCHING' : 'PENDING MATCH',
        statusType: 'searching',
        image: imageUrl || (reportType === 'lost' 
          ? 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'),
        category: category,
        description: description || 'No detailed description provided.'
      };

      onSubmitReport(newReport);
      setIsSubmitting(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setTitle('');
        setLocation('');
        setDescription('');
        setImageUrl('');
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-[#353437] transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
            <span className="text-xs font-semibold text-[#d2bbff] uppercase tracking-wider">
              AI-Powered Matching Engine
            </span>
          </div>
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white">
            Report an Item
          </h2>
          <p className="text-[#A1A1AA] text-sm mt-1">
            Provide details to search our global database instantly.
          </p>
        </div>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-bounce">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="text-xl font-bold text-white">Report Successfully Submitted!</h3>
            <p className="text-[#A1A1AA] text-sm max-w-xs">
              Our AI is now cross-referencing locations, time, and visual features across the database.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Report Type Selector */}
            <div className="grid grid-cols-2 gap-3 p-1 bg-[#18181B] rounded-xl border border-[#3F3F46]">
              <button
                type="button"
                onClick={() => setReportType('lost')}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  reportType === 'lost' 
                    ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow' 
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setReportType('found')}
                className={`py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  reportType === 'found' 
                    ? 'bg-[#ffb0cd] text-[#3e0022] shadow' 
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                I Found Something
              </button>
            </div>

            {/* Item Title */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                Item Title *
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]">
                  category
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g., iPhone 15 Pro, Leather Wallet, Keys"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm"
                />
              </div>
            </div>

            {/* Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3 text-white focus:outline-none focus:border-[#7C3AED] text-sm cursor-pointer"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Wallets & Bags">Wallets & Bags</option>
                  <option value="Keys">Keys</option>
                  <option value="Jewelry & Watches">Jewelry & Watches</option>
                  <option value="Documents & IDs">Documents & IDs</option>
                  <option value="Pets">Pets</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                  Location *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]">
                    location_on
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Central Park, JFK Airport"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Image URL Optional */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                Photo URL (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#958da1]">
                  image
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#ccc3d8] mb-1">
                Detailed Description
              </label>
              <textarea
                rows="3"
                placeholder="Mention unique features, color, brand, stickers, scratches..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                  <span>Indexing Report...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  <span>Publish Report & Search Matches</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
