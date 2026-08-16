import React, { useState, useEffect } from 'react';
import { createItemReport, updateItemReport } from '../services/itemService.js';

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

export default function ReportModal({
  isOpen,
  onClose,
  onSubmitSuccess,
  editingItem = null,
  initialType = null, // 'lost' | 'found' | null
}) {
  const isEditMode = Boolean(editingItem);

  // Mode step: 'choose' (for selecting Lost vs Found) or 'form' (filling details)
  const [step, setStep] = useState('choose');
  const [reportType, setReportType] = useState('lost'); // 'lost' | 'found'

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

  // Populate or reset form whenever isOpen, editingItem, or initialType changes
  useEffect(() => {
    if (isOpen) {
      if (editingItem) {
        setReportType(editingItem.type === 'found' ? 'found' : 'lost');
        setStep('form');
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
      } else if (initialType === 'lost' || initialType === 'found') {
        setReportType(initialType);
        setStep('form');
        resetFormFields();
      } else {
        setStep('choose');
        resetFormFields();
      }
    }
  }, [isOpen, editingItem, initialType]);

  if (!isOpen) return null;

  const resetFormFields = () => {
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
    resetFormFields();
    setStep('choose');
    onClose();
  };

  const handleSelectOption = (type) => {
    setReportType(type);
    setStep('form');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Frontend validation
    if (!title.trim()) {
      setErrorMsg(`Please enter the ${reportType === 'found' ? 'found item name' : 'item name or title'}.`);
      return;
    }
    if (!category) {
      setErrorMsg('Please select a category.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg(
        reportType === 'found'
          ? 'Please enter where the item was found.'
          : 'Please enter where the item was last seen.'
      );
      return;
    }
    if (!dateLost) {
      setErrorMsg(
        reportType === 'found'
          ? 'Please specify the date and time when the item was found.'
          : 'Please specify the date and time when the item was lost.'
      );
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please provide a detailed description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: reportType,
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
        result = await createItemReport(payload);
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
      setErrorMsg(
        err.message ||
          `Failed to ${isEditMode ? 'update' : 'submit'} ${reportType === 'found' ? 'found' : 'lost'} item report. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFound = reportType === 'found';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Inter',sans-serif]">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 md:p-8 relative border border-[#3F3F46]/70 max-h-[92vh] overflow-y-auto bg-[#131316]/95 shadow-2xl">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleModalClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* STEP 1: CHOICE SCREEN (Two Distinct Options) */}
        {step === 'choose' && !isEditMode && !isSuccess && (
          <div className="space-y-6 pt-2">
            {/* Header */}
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#d2bbff] text-xs font-semibold mb-3">
                <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse"></span>
                Report an Item
              </div>
              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What would you like to report?
              </h2>
              <p className="text-[#A1A1AA] text-sm mt-2">
                Choose an option below to report a missing belonging or register an item you discovered.
              </p>
            </div>

            {/* 2 Big Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: Lost Item */}
              <button
                type="button"
                onClick={() => handleSelectOption('lost')}
                className="group relative p-6 rounded-2xl bg-[#18181B] border-2 border-[#3F3F46] hover:border-[#EC4899] hover:bg-[#1f1a24] text-left transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(236,72,153,0.3)] hover:scale-[1.02] active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-3xl">search</span>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#EC4899]/20 text-[#ffb0cd] mb-1.5 border border-[#EC4899]/30">
                      Missing Belonging
                    </span>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white group-hover:text-[#ffb0cd] transition-colors">
                      I Lost Something
                    </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Report an item you lost to search the database and alert helpful finders in the community.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-[#ffb0cd] group-hover:translate-x-1 transition-transform">
                  <span>Report Lost Item</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>

              {/* Option 2: Found Item */}
              <button
                type="button"
                onClick={() => handleSelectOption('found')}
                className="group relative p-6 rounded-2xl bg-[#18181B] border-2 border-[#3F3F46] hover:border-emerald-400 hover:bg-[#14231e] text-left transition-all duration-300 flex flex-col justify-between gap-5 cursor-pointer shadow-lg hover:shadow-[0_10px_30px_-10px_rgba(52,211,153,0.3)] hover:scale-[1.02] active:scale-[0.99]"
              >
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                    <span className="material-symbols-outlined text-3xl">volunteer_activism</span>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 mb-1.5 border border-emerald-500/30">
                      Discovered Item
                    </span>
                    <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                      I Found Something
                    </h3>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Report an item you discovered on campus or in public so the rightful owner can safely reclaim it.
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>Report Found Item</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: FORM SCREEN (or Edit Mode / Success State) */}
        {((step === 'form' && !isSuccess) || isEditMode) && (
          <div>
            {/* Header & Type Toggle Switcher */}
            <div className="mb-6">
              {/* Back to Choice button if in create mode */}
              {!isEditMode && (
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#A1A1AA] hover:text-white mb-3 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Change Report Type
                </button>
              )}

              {/* Mode Toggle Tabs */}
              <div className="flex items-center gap-2 p-1 bg-[#18181B] border border-[#3F3F46] rounded-2xl w-full mb-4">
                <button
                  type="button"
                  onClick={() => setReportType('lost')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    !isFound
                      ? 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('found')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isFound
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md'
                      : 'text-[#A1A1AA] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">volunteer_activism</span>
                  I Found Something
                </button>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${
                    isFound
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-[#7C3AED]/15 border-[#7C3AED]/30 text-[#d2bbff]'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      isFound ? 'bg-emerald-400' : 'bg-[#7C3AED]'
                    }`}
                  ></span>
                  {isEditMode
                    ? `Edit ${isFound ? 'Found' : 'Lost'} Report`
                    : isFound
                    ? 'Report Discovered Item'
                    : 'Report Missing Belonging'}
                </div>
              </div>

              <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {isEditMode
                  ? `Edit ${isFound ? 'Found' : 'Lost'} Item Report`
                  : isFound
                  ? 'Report Found Item'
                  : 'Report Lost Item'}
              </h2>
              <p className="text-[#A1A1AA] text-xs sm:text-sm mt-1">
                {isFound
                  ? 'Provide details about where you discovered the item and where it is currently kept.'
                  : 'Provide the details so our matching system and community can help reunite you with your item.'}
              </p>
            </div>

            {/* Form */}
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
                  {isFound ? 'Found Item Name / Title' : 'Item Name / Title'}{' '}
                  <span className="text-[#EC4899]">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                    devices_other
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={
                      isFound
                        ? 'e.g. Black Leather Wallet, Silver Watch, Set of Keys, Blue Hydro Flask'
                        : 'e.g. iPhone 15 Pro, Black Leather Wallet, House Keys'
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                </div>
              </div>

              {/* 2. Category & Date/Time Grid */}
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
                    {isFound ? 'Date & Time Found' : 'Date & Time Lost'} <span className="text-[#EC4899]">*</span>
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
                  <label className="block text-xs font-semibold text-[#ccc3d8]">Report Status</label>
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

              {/* 3. Location */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  {isFound ? 'Discovery / Found Location' : 'Last Seen Location'}{' '}
                  <span className="text-[#EC4899]">*</span>
                </label>
                <div className="relative">
                  <span
                    className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg ${
                      isFound ? 'text-emerald-400' : 'text-[#EC4899]'
                    }`}
                  >
                    location_on
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={
                      isFound
                        ? 'e.g. Science Library Room 204, Cafeteria Table #6, Bus Stop 3'
                        : 'e.g. Central Park East Meadow, Library 2nd Floor, Bus #42'
                    }
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                  />
                </div>
              </div>

              {/* 4. Detailed Description */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  {isFound ? 'Found Circumstances & Condition' : 'Detailed Description'}{' '}
                  <span className="text-[#EC4899]">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={
                    isFound
                      ? 'Describe where you spotted it, what condition it is in, any visible characteristics...'
                      : 'Describe the circumstances, what it looks like, contents inside, etc.'
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3.5 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-sm transition-all"
                />
              </div>

              {/* 5. Distinguishing Details / Safekeeping Location */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  {isFound
                    ? 'Safekeeping / Turn-in Location & Marks (Optional)'
                    : 'Distinguishing Features (Optional)'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#958da1] text-lg">
                    {isFound ? 'security' : 'fingerprint'}
                  </span>
                  <input
                    type="text"
                    placeholder={
                      isFound
                        ? 'e.g. Turned over to Campus Security Desk, or Kept safely with finder'
                        : 'Colour, brand, serial number, stickers, scratches, case style'
                    }
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
                  <label className="block text-xs font-semibold text-[#ccc3d8]">Preferred Contact</label>
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
                {isEditMode ? (
                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="flex-1 py-4 rounded-2xl bg-[#18181B] border border-[#3F3F46] text-white font-bold text-sm hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setStep('choose')}
                    className="px-5 py-4 rounded-2xl bg-[#18181B] border border-[#3F3F46] text-[#A1A1AA] hover:text-white font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`py-4 rounded-2xl text-white font-bold text-base hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xl flex-1 ${
                    isFound
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                      : 'bg-gradient-to-r from-[#7C3AED] to-[#EC4899] primary-glow'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                      <span>{isEditMode ? 'Saving Changes...' : 'Submitting & Indexing Report...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xl">
                        {isEditMode ? 'save' : isFound ? 'volunteer_activism' : 'send'}
                      </span>
                      <span>
                        {isEditMode
                          ? 'Save Changes'
                          : isFound
                          ? 'Publish Found Item Report'
                          : 'Publish Lost Item Report'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success State */}
        {isSuccess && (
          <div className="py-10 text-center flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-300">
            <div
              className={`w-20 h-20 rounded-3xl text-white flex items-center justify-center shadow-lg animate-bounce ${
                isFound
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 shadow-[0_0_25px_rgba(52,211,153,0.5)]'
                  : 'bg-gradient-to-tr from-[#7C3AED] to-[#EC4899] primary-glow'
              }`}
            >
              <span className="material-symbols-outlined text-4xl">check</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isEditMode
                ? 'Report Updated Successfully!'
                : isFound
                ? 'Found Item Report Published!'
                : 'Lost Item Report Published!'}
            </h3>
            <p className="text-[#A1A1AA] text-sm max-w-md">
              Your {isFound ? 'found item report' : 'lost item report'} for{' '}
              <span className="text-white font-semibold">"{savedItem?.title || title}"</span> has been securely
              indexed and refreshed in the system.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-6 py-2.5 rounded-xl bg-white text-[#131316] font-bold text-xs hover:bg-white/90 transition-all cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
