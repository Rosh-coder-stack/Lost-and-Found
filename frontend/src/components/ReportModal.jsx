import React, { useState, useEffect } from 'react';
import { createLostItemReport, updateItemReport } from '../services/itemService.js';

const CATEGORIES = [
  'Electronics',
  'Wallets & Bags',
  'Keys',
  'Jewelry & Watches',
  'Documents & IDs',
  'Clothing & Accessories',
  'Pets',
  'Other',
];

const STATUS_OPTIONS = [
  { value: 'searching', label: 'Searching (Active)' },
  { value: 'pending_match', label: 'Pending Match' },
  { value: 'matched', label: 'Match Found' },
  { value: 'claimed', label: 'Claimed' },
  { value: 'returned', label: 'Returned to Owner' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ReportModal({ isOpen, onClose, onSubmitSuccess, editingItem = null }) {
  const isEditMode = Boolean(editingItem);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [dateLost, setDateLost] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [distinguishingDetails, setDistinguishingDetails] = useState('');
  const [contactPreference, setContactPreference] = useState('email');
  const [contactDetails, setContactDetails] = useState('');
  const [status, setStatus] = useState('searching');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedItem, setSavedItem] = useState(null);

  // Populate or reset form whenever isOpen or editingItem changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setTitle(editingItem.title || '');
        setCategory(editingItem.category || 'Electronics');
        setLocation(editingItem.location || '');
        if (editingItem.dateLost) {
          try {
            const d = new Date(editingItem.dateLost);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setDateLost(d.toISOString().slice(0, 16));
          } catch (e) {
            setDateLost(new Date().toISOString().slice(0, 16));
          }
        }
        setDescription(editingItem.description || '');
        setImageUrl(editingItem.imageUrl || editingItem.image || '');
        setDistinguishingDetails(editingItem.distinguishingDetails || '');
        setContactPreference(editingItem.contactPreference || 'email');
        setContactDetails(editingItem.contactDetails || '');
        setStatus(editingItem.status ? editingItem.status.toLowerCase() : 'searching');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setCategory('Electronics');
    setLocation('');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDateLost(now.toISOString().slice(0, 16));
    setDescription('');
    setImageUrl('');
    setDistinguishingDetails('');
    setContactPreference('email');
    setContactDetails('');
    setStatus('searching');
    setErrorMsg('');
    setIsSuccess(false);
    setSavedItem(null);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend validation
    if (!title.trim()) {
      setErrorMsg('Please enter the item name or title.');
      return;
    }
    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Please enter where the item was last seen.');
      return;
    }
    if (!dateLost) {
      setErrorMsg('Please specify the date and time when the item was lost.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a detailed description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        category,
        location: location.trim(),
        dateLost: new Date(dateLost).toISOString(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        distinguishingDetails: distinguishingDetails.trim() || undefined,
        contactPreference,
        contactDetails: contactDetails.trim() || undefined,
        ...(isEditMode ? { status } : {}),
      };

      let result;
      if (isEditMode) {
        const itemId = editingItem._id || editingItem.id;
        result = await updateItemReport(itemId, payload);
      } else {
        result = await createLostItemReport(payload);
      }

      const returnedData = result.data || result;

      setIsSuccess(true);
      setSavedItem(returnedData);

      if (onSubmitSuccess) {
        onSubmitSuccess(returnedData, isEditMode ? 'updated' : 'created');
      }

      // Auto close modal after showing success screen
      setTimeout(() => {
        handleModalClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || `Failed to ${isEditMode ? 'update' : 'submit'} lost item report. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Inter',sans-serif]">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 md:p-8 relative border border-[#3F3F46]/70 max-h-[92vh] overflow-y-auto bg-[#131316]/95 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#d2bbff] text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
            {isEditMode ? 'Edit Existing Report' : 'Report Missing Belonging'}
          </div>
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {isEditMode ? 'Edit Lost Item Report' : 'Report Lost Item'}
          </h2>
          <p className="text-[#A1A1AA] text-sm mt-1">
            {isEditMode
              ? 'Update the report details, status, or contact notes.'
              : 'Provide the details so our matching system and community can help reunite you with your item.'}
          </p>
        </div>

        {/* Success State */}
        {isSuccess ? (
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-lg primary-glow animate-bounce">
              <span className="material-symbols-outlined text-4xl">check</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isEditMode ? 'Report Updated Successfully!' : 'Report Successfully Published!'}
            </h3>
            <p className="text-[#A1A1AA] text-sm max-w-md">
              Your lost item report for <span className="text-white font-semibold">"{savedItem?.title || title}"</span> has been securely updated and refreshed in the dashboard.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-xl bg-white text-[#7C3AED] font-bold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in shake">
                <span className="material-symbols-outlined text-base flex-shrink-0 text-red-400">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Item Title */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#ccc3d8]">
                Item Name / Title <span className="text-[#EC4899]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                  devices_other
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro, Black Leather Wallet, House Keys"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* 2. Category & Date/Time Lost Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Category <span className="text-[#EC4899]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-[#7C3AED] text-sm cursor-pointer transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Date & Time Lost <span className="text-[#EC4899]">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dateLost}
                  onChange={(e) => setDateLost(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-[#7C3AED] text-sm transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* If Edit Mode: Status Selector */}
            {isEditMode && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Report Status
                </label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-[#7C3AED] text-sm cursor-pointer transition-all"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 3. Last Seen Location */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#ccc3d8]">
                Last Seen Location <span className="text-[#EC4899]">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                  location_on
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Central Park East Meadow, Library 2nd Floor, Bus #42"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* 4. Detailed Description */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#ccc3d8]">
                Detailed Description <span className="text-[#EC4899]">*</span>
              </label>
              <textarea
                rows="3"
                required
                placeholder="Describe the circumstances, what it looks like, contents inside, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3.5 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
              />
            </div>

            {/* 5. Distinguishing Details (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#ccc3d8]">
                Distinguishing Features (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                  fingerprint
                </span>
                <input
                  type="text"
                  placeholder="Colour, brand, serial number, stickers, scratches, case style"
                  value={distinguishingDetails}
                  onChange={(e) => setDistinguishingDetails(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* 6. Photo URL (Optional) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#ccc3d8]">
                Photo Image URL (Optional)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                  image
                </span>
                <input
                  type="url"
                  placeholder="https://example.com/photo.jpg (leave blank for category photo)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* 7. Contact Preference & Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Preferred Contact
                </label>
                <select
                  value={contactPreference}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3.5 text-white focus:outline-none focus:border-[#7C3AED] text-sm cursor-pointer transition-all"
                >
                  <option value="email">Account Email (Private)</option>
                  <option value="phone">Phone / SMS</option>
                  <option value="app_chat">FoundIt In-App Chat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Contact Number / Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. +1 555-0199"
                  value={contactDetails}
                  onChange={(e) => setContactDetails(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 px-3.5 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-3 flex gap-3">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="flex-1 py-4 rounded-2xl bg-[#18181B] border border-[#3F3F46] text-white font-bold text-sm hover:bg-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-base primary-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xl ${
                  isEditMode ? 'flex-2' : 'w-full'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    <span>{isEditMode ? 'Saving Changes...' : 'Submitting & Indexing Report...'}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">{isEditMode ? 'save' : 'send'}</span>
                    <span>{isEditMode ? 'Save Changes' : 'Publish Lost Item Report'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

