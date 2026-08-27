import React, { useState } from 'react';
import { IMAGES } from '../data/mockData';

// Fallback images based on category
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

// Helper to format date / relative time
const formatTimeAgo = (dateInput) => {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

export default function DashboardPage({
  userReports = [],
  isLoadingReports = false,
  incomingClaims = [],
  myClaims = [],
  isLoadingClaims = false,
  onOpenReport,
  onOpenBrowse,
  onSelectItem,
  onOpenStories,
  onEditReport,
  onDeleteReport,
  onAcceptClaim,
  onRejectClaim,
  onAskProof,
  onReplyProof,
  onResubmitClaim,
  user,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Action States inside Dashboard Claims
  const [selectedClaimAction, setSelectedClaimAction] = useState(null);
  const [actionModalType, setActionModalType] = useState(null); // 'accept' | 'reject' | 'ask_proof' | 'reply' | 'resubmit'
  const [actionInputText, setActionInputText] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 22) return 'Good evening';
    return 'Good night';
  };

  // Extract only the first name and capitalize nicely
  const getFirstName = (name) => {
    if (!name || typeof name !== 'string') return 'Friend';
    const cleanName = name.trim().split(/\s+/)[0];
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase();
  };

  const greeting = getGreeting();
  const firstName = getFirstName(user?.name);

  // Normalize reports
  const normalizedReports = userReports.map((report) => {
    const id = report._id || report.id;
    const image = report.imageUrl || report.image || CATEGORY_DEFAULT_IMAGES[report.category] || CATEGORY_DEFAULT_IMAGES['Other'];
    const timeAgo = report.createdAt ? formatTimeAgo(report.createdAt) : (report.timeAgo || 'Recently');
    const statusType = report.statusType || (report.status === 'matched' ? 'match' : (['resolved', 'returned', 'claimed'].includes(report.status) ? 'resolved' : 'searching'));
    const statusText = (report.status || 'SEARCHING').toUpperCase();
    const type = report.type === 'found' ? 'found' : 'lost';

    return {
      ...report,
      id,
      image,
      timeAgo,
      statusType,
      status: statusText,
      type,
    };
  });

  const lostCount = normalizedReports.filter((r) => r.type === 'lost').length;
  const foundCount = normalizedReports.filter((r) => r.type === 'found').length;
  const matchesCount = normalizedReports.filter((r) => r.statusType === 'match' || r.status === 'MATCHED').length;
  const pendingRequestsCount = incomingClaims.filter((c) => ['PENDING', 'FOLLOW_UP_REQUIRED'].includes(c.status)).length;
  const myActionNeededCount = myClaims.filter((c) => c.status === 'FOLLOW_UP_REQUIRED' || (c.status === 'REJECTED' && c.attemptNumber === 1)).length;

  // Filter user reports based on selected tab
  const filteredReports = normalizedReports.filter((report) => {
    if (activeTab === 'lost') return report.type === 'lost';
    if (activeTab === 'found') return report.type === 'found';
    if (activeTab === 'matches') return report.statusType === 'match' || report.status === 'MATCHED';
    return true;
  });

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      if (onDeleteReport) {
        await onDeleteReport(itemToDelete);
      }
      setItemToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExecuteClaimAction = async () => {
    if (!selectedClaimAction || !actionModalType) return;
    setIsActionLoading(true);
    const claimId = selectedClaimAction._id || selectedClaimAction.id;
    try {
      if (actionModalType === 'accept' && onAcceptClaim) {
        await onAcceptClaim(claimId, actionInputText);
      } else if (actionModalType === 'reject' && onRejectClaim) {
        await onRejectClaim(claimId, actionInputText);
      } else if (actionModalType === 'ask_proof' && onAskProof) {
        await onAskProof(claimId, actionInputText);
      } else if (actionModalType === 'reply' && onReplyProof) {
        await onReplyProof(claimId, actionInputText);
      } else if (actionModalType === 'resubmit' && onResubmitClaim) {
        await onResubmitClaim(claimId, { proofMessage: actionInputText });
      }
      setSelectedClaimAction(null);
      setActionModalType(null);
      setActionInputText('');
    } catch (err) {
      console.error('Claim action failed:', err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 max-w-[1280px] mx-auto px-6 font-['Inter',sans-serif]">
      {/* Top Header & Welcome */}
      <section className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C3AED]/10 border border-[#7C3AED]/20 text-[#d2bbff] text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-pulse"></span>
            Lost & Found Command Center
          </div>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {greeting},{' '}
            <span className="bg-gradient-to-r from-[#d2bbff] via-[#f4d4e3] to-[#ffb0cd] bg-clip-text text-transparent">
              {firstName}
            </span>
          </h1>
          <p className="text-sm md:text-base text-[#A1A1AA] mt-1 max-w-xl">
            Track your reported belongings, registered found items, live visual matches, and claims.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => onOpenReport && onOpenReport()}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-sm primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Report Item
          </button>
          <button
            onClick={onOpenBrowse}
            className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-[#18181B] border border-[#3F3F46] hover:border-[#7C3AED] text-white font-bold text-sm hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg text-[#d2bbff]">search</span>
            Browse All Items
          </button>
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Reports, Claims & Filters */}
        <div className="lg:col-span-8 space-y-8">
          <section>
            {/* Header & Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-bold text-white tracking-tight">
                  {activeTab === 'requests'
                    ? 'Incoming Claim Requests'
                    : activeTab === 'my_claims'
                    ? 'Your Submitted Claims'
                    : 'Your Reports'}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  {activeTab === 'requests'
                    ? 'Claims submitted by community members on items you reported'
                    : activeTab === 'my_claims'
                    ? 'Claims you submitted to verify and recover your items'
                    : 'Items you have reported as lost or found'}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#18181B] border border-[#27272A] rounded-xl w-fit flex-wrap">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Reports ({normalizedReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('lost')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'lost'
                      ? 'bg-[#EC4899] text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Lost ({lostCount})
                </button>
                <button
                  onClick={() => setActiveTab('found')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'found'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  Found ({foundCount})
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'requests'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span>Requests ({incomingClaims.length})</span>
                  {pendingRequestsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('my_claims')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'my_claims'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span>My Claims ({myClaims.length})</span>
                  {myActionNeededCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB VIEW 1: INCOMING CLAIM REQUESTS (Reporter perspective) */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {isLoadingClaims ? (
                  <div className="p-8 text-center text-xs text-[#A1A1AA] bg-[#18181B] rounded-2xl border border-white/5 animate-pulse">
                    Loading claim requests...
                  </div>
                ) : incomingClaims.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#d2bbff] flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">verified_user</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No Claim Requests Yet</h3>
                    <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto">
                      When community members submit ownership proof on items you reported, their requests will appear here for verification.
                    </p>
                  </div>
                ) : (
                  incomingClaims.map((claim) => (
                    <div
                      key={claim._id || claim.id}
                      className="p-6 rounded-2xl bg-[#131316] border border-[#27272A] hover:border-[#7C3AED]/50 transition-all space-y-4 shadow-xl"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{claim.itemTitle}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff]">
                              Attempt {claim.attemptNumber} / 2
                            </span>
                          </div>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">
                            Claimed by <strong className="text-white">{claim.claimantName || 'Community Member'}</strong> &bull; {formatTimeAgo(claim.createdAt)}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div>
                          {claim.status === 'ACCEPTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              ACCEPTED
                            </span>
                          )}
                          {claim.status === 'PENDING' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">hourglass_top</span>
                              ACTION NEEDED
                            </span>
                          )}
                          {claim.status === 'FOLLOW_UP_REQUIRED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff] flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">question_answer</span>
                              AWAITING CLAIMANT REPLY
                            </span>
                          )}
                          {claim.status === 'REJECTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-300">
                              REJECTED (Attempt 1)
                            </span>
                          )}
                          {claim.status === 'FINAL_REJECTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                              PERMANENTLY REJECTED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Proof Message */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                          Claimant's Proof / Message:
                        </span>
                        <p className="text-xs text-[#e5e1e4] bg-[#18181B] p-3.5 rounded-xl border border-white/5 leading-relaxed">
                          "{claim.proofMessage}"
                        </p>
                      </div>

                      {/* Conversation History if more than 1 message */}
                      {claim.messages && claim.messages.length > 1 && (
                        <div className="space-y-2 pt-1">
                          <span className="text-[11px] font-bold text-[#d2bbff] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">forum</span>
                            Thread ({claim.messages.length} messages)
                          </span>
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {claim.messages.map((m, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl text-xs ${
                                  m.senderRole === 'reporter'
                                    ? 'bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#e5e1e4] ml-4'
                                    : 'bg-[#27272A]/70 border border-white/10 text-white mr-4'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-1 text-[10px] text-[#A1A1AA]">
                                  <strong>{m.senderRole === 'reporter' ? 'You' : claim.claimantName}</strong>
                                  <span>{formatTimeAgo(m.createdAt)}</span>
                                </div>
                                <p>{m.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Details Revealed post-acceptance */}
                      {claim.status === 'ACCEPTED' && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-1.5">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span className="material-symbols-outlined text-base text-emerald-400">verified</span>
                            Verified Claimant Contact
                          </div>
                          <div className="bg-black/50 p-2.5 rounded-lg border border-emerald-500/20 font-mono text-white text-[11px] space-y-0.5">
                            <p><strong>Name:</strong> {claim.claimantName}</p>
                            <p><strong>Email:</strong> {claim.claimantEmail}</p>
                            {claim.claimantPhone && <p><strong>Phone:</strong> {claim.claimantPhone}</p>}
                          </div>
                        </div>
                      )}

                      {/* Reporter Decision Action Buttons */}
                      {['PENDING', 'FOLLOW_UP_REQUIRED'].includes(claim.status) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimAction(claim);
                              setActionModalType('accept');
                              setActionInputText('');
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimAction(claim);
                              setActionModalType('ask_proof');
                              setActionInputText('');
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/50 hover:bg-[#7C3AED]/30 text-[#d2bbff] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">contact_support</span>
                            Ask for More Proof
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimAction(claim);
                              setActionModalType('reject');
                              setActionInputText('');
                            }}
                            className="flex-1 py-2.5 px-3 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB VIEW 2: MY SUBMITTED CLAIMS (Claimant perspective) */}
            {activeTab === 'my_claims' && (
              <div className="space-y-4">
                {isLoadingClaims ? (
                  <div className="p-8 text-center text-xs text-[#A1A1AA] bg-[#18181B] rounded-2xl border border-white/5 animate-pulse">
                    Loading your claims...
                  </div>
                ) : myClaims.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#d2bbff] flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">search_check</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No Claims Submitted Yet</h3>
                    <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto mb-5">
                      Found an item listed that belongs to you? Click "Verify & Claim Item" on any report to submit ownership proof.
                    </p>
                    <button
                      onClick={onOpenBrowse}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-md"
                    >
                      Browse Lost & Found Items
                    </button>
                  </div>
                ) : (
                  myClaims.map((claim) => (
                    <div
                      key={claim._id || claim.id}
                      className="p-6 rounded-2xl bg-[#131316] border border-[#27272A] hover:border-[#7C3AED]/50 transition-all space-y-4 shadow-xl"
                    >
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-white">{claim.itemTitle}</h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff]">
                              Attempt {claim.attemptNumber} / 2
                            </span>
                          </div>
                          <p className="text-xs text-[#A1A1AA] mt-0.5">
                            Reported by <strong className="text-white">{claim.reporterName || 'Item Reporter'}</strong> &bull; {formatTimeAgo(claim.createdAt)}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div>
                          {claim.status === 'ACCEPTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              VERIFIED & ACCEPTED
                            </span>
                          )}
                          {claim.status === 'PENDING' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">hourglass_top</span>
                              PENDING REVIEW
                            </span>
                          )}
                          {claim.status === 'FOLLOW_UP_REQUIRED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EC4899]/20 border border-[#EC4899]/40 text-[#ffb0cd] flex items-center gap-1 animate-pulse">
                              <span className="material-symbols-outlined text-xs">priority_high</span>
                              ACTION REQUIRED
                            </span>
                          )}
                          {claim.status === 'REJECTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 border border-red-500/40 text-red-300">
                              REJECTED (1 Attempt Left)
                            </span>
                          )}
                          {claim.status === 'FINAL_REJECTED' && (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                              FINAL REJECTED
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Submitted Proof */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                          Your Proof:
                        </span>
                        <p className="text-xs text-[#e5e1e4] bg-[#18181B] p-3 rounded-xl border border-white/5 leading-relaxed">
                          "{claim.proofMessage}"
                        </p>
                      </div>

                      {/* State Specific Actions / Details */}
                      {claim.status === 'ACCEPTED' && (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <span className="material-symbols-outlined text-lg text-emerald-400">verified</span>
                            Ownership Verified! Reporter Contact Details:
                          </div>
                          <div className="bg-black/50 p-3 rounded-lg border border-emerald-500/20 font-mono text-white text-xs space-y-1">
                            <p><strong>Name:</strong> {claim.reporterName || 'Item Reporter'}</p>
                            <p><strong>Email:</strong> {claim.reporterEmail || 'Available upon return setup'}</p>
                            {claim.reporterContactDetails && (
                              <p><strong>Safekeeping Note / Phone:</strong> {claim.reporterContactDetails}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {claim.status === 'FOLLOW_UP_REQUIRED' && (
                        <div className="p-4 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/40 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm text-[#d2bbff]">help</span>
                              Reporter requested additional proof
                            </span>
                          </div>
                          {claim.messages && claim.messages.length > 0 && (
                            <p className="text-xs text-white bg-[#121215] p-3 rounded-lg border border-white/10 italic">
                              "{claim.messages[claim.messages.length - 1].message}"
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimAction(claim);
                              setActionModalType('reply');
                              setActionInputText('');
                            }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:scale-[1.01] transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">reply</span>
                            Reply with Proof
                          </button>
                        </div>
                      )}

                      {claim.status === 'REJECTED' && claim.attemptNumber === 1 && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-3">
                          <div className="flex items-center gap-2 text-red-300 font-bold">
                            <span className="material-symbols-outlined text-base">warning</span>
                            First Claim Attempt Rejected &bull; 1 Final Attempt Remaining
                          </div>
                          <p className="text-[11px] text-red-200/90 leading-relaxed">
                            Please submit strong and specific proof of ownership. If the next request is rejected, you will no longer be able to claim this item.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimAction(claim);
                              setActionModalType('resubmit');
                              setActionInputText('');
                            }}
                            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            Submit Final Claim Attempt
                          </button>
                        </div>
                      )}

                      {claim.status === 'FINAL_REJECTED' && (
                        <div className="p-3.5 rounded-xl bg-zinc-900 border border-red-500/20 text-zinc-400 text-xs flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-red-400">block</span>
                          <span>Final ownership claim rejected. You can no longer submit claims for this item.</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB VIEW 3: USER REPORTS (All / Lost / Found / Matches) */}
            {!['requests', 'my_claims'].includes(activeTab) && (
              <>
                {isLoadingReports ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[1, 2].map((n) => (
                      <div key={n} className="glass-card rounded-2xl p-5 border border-white/5 animate-pulse space-y-4">
                        <div className="h-40 bg-white/5 rounded-xl"></div>
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-3 bg-white/5 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 text-[#d2bbff] flex items-center justify-center mx-auto mb-4">
                      <span className="material-symbols-outlined text-3xl">inventory_2</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No reports found</h3>
                    <p className="text-sm text-[#A1A1AA] max-w-sm mx-auto mb-6">
                      {activeTab === 'all'
                        ? "You haven't reported any lost or found items yet. Submit your report to start tracking."
                        : `No reports currently found in the "${activeTab}" category.`}
                    </p>
                    <button
                      onClick={() => onOpenReport && onOpenReport()}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-xs font-bold cursor-pointer hover:scale-105 transition-all shadow-md"
                    >
                      Report Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => onSelectItem && onSelectItem(report)}
                        className="glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer border border-[#27272A] hover:border-[#7C3AED]/70 hover:shadow-[0_10px_30px_-10px_rgba(124,58,237,0.3)] transition-all duration-300 bg-[#131316]/80"
                      >
                        {/* Thumbnail */}
                        <div className="h-48 w-full bg-[#0d0d10] relative overflow-hidden flex items-center justify-center border-b border-[#27272A]">
                          <img
                            src={report.image}
                            alt={report.title}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = CATEGORY_DEFAULT_IMAGES[report.category] || CATEGORY_DEFAULT_IMAGES['Other'];
                            }}
                          />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            {report.type === 'found' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/90 text-white shadow-md backdrop-blur-md">
                                <span className="material-symbols-outlined text-[13px]">volunteer_activism</span>
                                FOUND
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EC4899]/90 text-white shadow-md backdrop-blur-md">
                                <span className="material-symbols-outlined text-[13px]">search</span>
                                LOST
                              </span>
                            )}
                          </div>

                          <div className="absolute top-3 right-3 z-10 pointer-events-none">
                            {report.statusType === 'match' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED] text-white shadow-lg border border-purple-400/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                {report.status}
                              </span>
                            ) : report.statusType === 'resolved' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                {report.status}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#18181B]/90 text-[#d2bbff] border border-[#3F3F46]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#d2bbff] animate-pulse"></span>
                                {report.status}
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white/90 border border-white/10">
                              {report.category || 'Belonging'}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                          <div>
                            <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white group-hover:text-[#d2bbff] transition-colors line-clamp-1">
                              {report.title}
                            </h3>
                            <p className="text-xs text-[#A1A1AA] mt-1 line-clamp-2 leading-relaxed">
                              {report.description}
                            </p>
                            {report.location && (
                              <p className="text-[11px] text-[#958da1] mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px] text-[#EC4899]">location_on</span>
                                <span className="line-clamp-1">{report.location}</span>
                              </p>
                            )}
                          </div>

                          {/* Actions & Footer */}
                          <div className="pt-3 border-t border-[#27272A] flex flex-col gap-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[#71717A] text-[11px] flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">schedule</span>
                                {report.timeAgo}
                              </span>
                              <span className="text-[#d2bbff] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                                Details <span className="material-symbols-outlined text-xs">arrow_forward</span>
                              </span>
                            </div>

                            {/* Owner Buttons */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onEditReport) onEditReport(report);
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-[#18181B] hover:bg-[#7C3AED]/20 border border-[#3F3F46] hover:border-[#7C3AED]/50 text-white hover:text-[#d2bbff] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                title="Edit Report"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                <span>Edit</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToDelete(report);
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-[#18181B] hover:bg-red-500/20 border border-[#3F3F46] hover:border-red-500/50 text-white hover:text-red-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                                title="Delete Report"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Right Column (4 cols): Live Discoveries & Safe Recovery */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Community Discoveries Feed */}
          <div className="glass-card rounded-2xl p-6 border border-[#27272A] bg-[#131316]/80 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center text-[#d2bbff]">
                  <span className="material-symbols-outlined text-lg">celebration</span>
                </div>
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold text-white">
                    Live Discoveries
                  </h3>
                  <p className="text-[11px] text-[#A1A1AA]">Real-time community recoveries</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.sarahAvatar}
                  alt="Sarah"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#7C3AED]/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Sarah J.</p>
                    <span className="text-[10px] text-[#71717A]">2m ago</span>
                  </div>
                  <p className="text-xs text-[#d2bbff] font-semibold mt-0.5">
                    Apartment Keys Recovered
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Returned by a kind neighbor via FoundIt within minutes!"
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.markAvatar}
                  alt="Mark"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-[#EC4899]/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Mark T.</p>
                    <span className="text-[10px] text-[#71717A]">45m ago</span>
                  </div>
                  <p className="text-xs text-[#ffb0cd] font-semibold mt-0.5">
                    Sony Camera Reunited
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Found and matched with zero hassle. Truly incredible service."
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#18181B]/60 border border-white/5 flex gap-3 items-start">
                <img
                  src={IMAGES.elenaAvatar}
                  alt="Elena"
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-emerald-500/40"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">Elena R.</p>
                    <span className="text-[10px] text-[#71717A]">2h ago</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Lost Puppy Safely Returned
                  </p>
                  <p className="text-[11px] text-[#A1A1AA] italic mt-1 line-clamp-2">
                    "Bella is back home! Thank you to the entire community."
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenStories}
              className="w-full mt-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#e5e1e4] hover:bg-white/10 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm text-[#d2bbff]">auto_stories</span>
              View Success Wall
            </button>
          </div>

          {/* Safe Recovery Guidelines Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#121215] border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-lg">shield</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-sm font-bold text-white">
                Safe Recovery Protocol
              </h4>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
              Always verify ownership proof before meeting. For handoffs, choose well-lit public spots or local precinct safe zones.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              100% Encrypted Messaging & Privacy
            </div>
          </div>
        </aside>
      </div>

      {/* Claim Action Dialog Modal */}
      {selectedClaimAction && actionModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-[#3F3F46] bg-[#131316]/98 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold text-white flex items-center gap-2">
                {actionModalType === 'accept' && <span className="text-emerald-400 material-symbols-outlined">check_circle</span>}
                {actionModalType === 'reject' && <span className="text-red-400 material-symbols-outlined">cancel</span>}
                {actionModalType === 'ask_proof' && <span className="text-[#d2bbff] material-symbols-outlined">help</span>}
                {actionModalType === 'reply' && <span className="text-[#d2bbff] material-symbols-outlined">reply</span>}
                {actionModalType === 'resubmit' && <span className="text-red-400 material-symbols-outlined">verified_user</span>}
                {actionModalType === 'accept' && 'Accept Ownership Claim'}
                {actionModalType === 'reject' && `Reject Claim (Attempt ${selectedClaimAction.attemptNumber} of 2)`}
                {actionModalType === 'ask_proof' && 'Ask Claimant for Specific Proof'}
                {actionModalType === 'reply' && 'Reply with Additional Proof'}
                {actionModalType === 'resubmit' && 'Submit Final Claim Attempt'}
              </h3>
              <button
                onClick={() => {
                  setSelectedClaimAction(null);
                  setActionModalType(null);
                  setActionInputText('');
                }}
                className="text-[#71717A] hover:text-white"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <p className="text-xs text-[#A1A1AA]">
              {actionModalType === 'accept' && 'This will verify ownership, mark the item as claimed, and reveal direct contact information.'}
              {actionModalType === 'reject' && (selectedClaimAction.attemptNumber === 1 ? 'This is the first rejection. The claimant will have 1 final attempt remaining.' : 'This is the final attempt. Rejecting now will permanently block the claimant from this item.')}
              {actionModalType === 'ask_proof' && 'Specify what exact details or markings you need the claimant to describe.'}
              {actionModalType === 'reply' && 'Provide your response answering the reporter’s question.'}
              {actionModalType === 'resubmit' && 'Submit clear, strong proof of ownership. This is your final attempt.'}
            </p>

            <textarea
              rows="3"
              required
              placeholder={
                actionModalType === 'accept'
                  ? 'Optional note (e.g., Safe pickup instructions)...'
                  : actionModalType === 'reject'
                  ? 'Reason for rejection...'
                  : actionModalType === 'ask_proof'
                  ? 'Describe what specific proof you need...'
                  : 'Enter your proof / response...'
              }
              value={actionInputText}
              onChange={(e) => setActionInputText(e.target.value)}
              className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-xs leading-relaxed"
            />

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => {
                  setSelectedClaimAction(null);
                  setActionModalType(null);
                  setActionInputText('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#18181B] border border-[#3F3F46] text-white font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleExecuteClaimAction}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer shadow-md ${
                  actionModalType === 'accept'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : actionModalType === 'reject' || actionModalType === 'resubmit'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                }`}
              >
                {isActionLoading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 relative border border-red-500/30 bg-[#131316]/95 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">delete_forever</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-white">
                  Delete Lost Report?
                </h3>
                <p className="text-xs text-[#A1A1AA]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#e5e1e4] leading-relaxed">
              Are you sure you want to permanently delete your report for{' '}
              <span className="text-white font-bold">"{itemToDelete.title}"</span>? It will be removed from your dashboard and the public search directory.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#18181B] border border-[#3F3F46] text-white font-bold text-xs hover:bg-white/5 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                {isDeleting ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
