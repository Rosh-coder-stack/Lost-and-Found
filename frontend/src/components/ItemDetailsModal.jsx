import React, { useState, useEffect, useCallback } from 'react';
import {
  createClaim,
  getClaimsForItem,
  askFollowUpProof,
  replyFollowUpProof,
  acceptClaim,
  rejectClaim,
  resubmitClaim,
} from '../services/claimService';

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
  currentUser = null,
  onEditItem = null,
  onDeleteItem = null,
  onClaimSubmitted = null,
}) {
  const [claimMessage, setClaimMessage] = useState('');
  const [claimantPhone, setClaimantPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Claims loaded for this item
  const [itemClaims, setItemClaims] = useState([]);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);

  // Active follow-up reply / reporter action states
  const [replyText, setReplyText] = useState('');
  const [resubmitText, setResubmitText] = useState('');
  const [actionClaimId, setActionClaimId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'follow_up' | 'reject' | 'accept'
  const [actionInput, setActionInput] = useState('');

  const itemId = item?._id || item?.id;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isOwner = currentUserId && item?.userId && currentUserId.toString() === item.userId.toString();
  const isItemClaimed = ['claimed', 'resolved', 'returned'].includes((item?.status || '').toLowerCase());

  // Fetch claims for this item
  const fetchItemClaims = useCallback(async () => {
    if (!itemId || !currentUser) return;
    try {
      setIsLoadingClaims(true);
      const res = await getClaimsForItem(itemId);
      if (res && res.data) {
        setItemClaims(res.data);
      }
    } catch (err) {
      console.warn('Error fetching item claims:', err.message);
    } finally {
      setIsLoadingClaims(false);
    }
  }, [itemId, currentUser]);

  useEffect(() => {
    if (item && currentUser) {
      fetchItemClaims();
    }
  }, [item, currentUser, fetchItemClaims]);

  if (!item) return null;

  const image = item.imageUrl || item.image || CATEGORY_DEFAULT_IMAGES[item.category] || CATEGORY_DEFAULT_IMAGES['Other'];
  const isFound = item.type === 'found';

  // Find user's existing claim if not owner
  const myClaim = !isOwner && itemClaims.length > 0 ? itemClaims[0] : null;

  // Handle Initial Claim Submission (Attempt 1)
  const handleInitialClaim = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Please log in to submit a claim.');
      return;
    }
    if (!claimMessage.trim()) {
      setErrorMsg('Please provide proof of ownership details.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await createClaim({
        itemId,
        proofMessage: claimMessage,
        claimantPhone,
      });
      setSuccessMsg('Claim verification request submitted successfully!');
      setClaimMessage('');
      setClaimantPhone('');
      await fetchItemClaims();
      if (onClaimSubmitted) onClaimSubmitted(res.data);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit claim request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Claimant Reply to Follow-up
  const handleSendReply = async (claimId) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await replyFollowUpProof(claimId, replyText);
      setSuccessMsg('Response sent to the reporter.');
      setReplyText('');
      await fetchItemClaims();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Claimant Resubmit (Attempt 2)
  const handleResubmitAttempt = async (claimId) => {
    if (!resubmitText.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await resubmitClaim(claimId, {
        proofMessage: resubmitText,
        claimantPhone,
      });
      setSuccessMsg('Final claim attempt submitted successfully.');
      setResubmitText('');
      await fetchItemClaims();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit final attempt.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Reporter Actions (Accept, Reject, Ask for More Proof)
  const handleExecuteReporterAction = async () => {
    if (!actionClaimId || !actionType) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (actionType === 'accept') {
        await acceptClaim(actionClaimId, actionInput);
        setSuccessMsg('Claim accepted! Contact information is now shared.');
      } else if (actionType === 'reject') {
        await rejectClaim(actionClaimId, actionInput);
        setSuccessMsg('Claim rejected.');
      } else if (actionType === 'follow_up') {
        if (!actionInput.trim()) {
          setErrorMsg('Please specify what proof you are requesting.');
          setIsSubmitting(false);
          return;
        }
        await askFollowUpProof(actionClaimId, actionInput);
        setSuccessMsg('Follow-up question sent to claimant.');
      }
      setActionClaimId(null);
      setActionType(null);
      setActionInput('');
      await fetchItemClaims();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 font-['Inter',sans-serif]">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 md:p-8 relative border border-[#3F3F46] max-h-[92vh] overflow-y-auto bg-[#131316]/98 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A1A1AA] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Alerts / Notifications */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-red-400">error</span>
            <span className="flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
            <span className="flex-1">{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
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

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isItemClaimed
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff]'
            }`}
          >
            {isItemClaimed ? 'CLAIMED & RESOLVED' : (item.status || 'REPORTED').toUpperCase()}
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

        {/* Title & Location */}
        <div>
          <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl md:text-3xl font-bold text-white tracking-tight">
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
        <div className="w-full h-64 sm:h-72 md:h-80 rounded-2xl overflow-hidden bg-[#0d0d10] relative flex items-center justify-center border border-[#3F3F46]/60 p-2">
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-contain rounded-xl"
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

        {/* Reporter information snapshot */}
        {item.reporterName && (
          <div className="flex items-center justify-between text-xs text-[#A1A1AA] px-1">
            <span>Reported by: <span className="text-white font-medium">{item.reporterName}</span></span>
            <span>{isFound ? 'Date Found:' : 'Date Lost:'} <span className="text-white">{item.dateLost ? new Date(item.dateLost).toLocaleDateString() : (item.timeAgo || 'Recently')}</span></span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: OWNER VIEW - INCOMING CLAIMS & VERIFICATION CONTROLS           */}
        {/* ========================================================================= */}
        {isOwner ? (
          <div className="space-y-4 pt-3 border-t border-[#27272A]">
            <div className="flex items-center justify-between">
              <h3 className="font-['Plus_Jakarta_Sans',sans-serif] text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#d2bbff]">verified_user</span>
                Incoming Ownership Claims ({itemClaims.length})
              </h3>
            </div>

            {isLoadingClaims ? (
              <div className="p-4 text-center text-xs text-[#A1A1AA] bg-[#18181B] rounded-2xl border border-white/5 animate-pulse">
                Loading claim verifications...
              </div>
            ) : itemClaims.length === 0 ? (
              <div className="p-5 rounded-2xl bg-[#18181B]/70 border border-[#27272A] text-center">
                <p className="text-xs text-[#A1A1AA]">No ownership claims received for this item yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {itemClaims.map((claim) => (
                  <div
                    key={claim._id || claim.id}
                    className="p-5 rounded-2xl bg-[#18181B] border border-[#3F3F46] space-y-4 shadow-lg"
                  >
                    {/* Claim Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#27272A]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            Claimant: {claim.claimantName || 'Community Member'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff]">
                            Attempt {claim.attemptNumber} / 2
                          </span>
                        </div>
                        <span className="text-[11px] text-[#71717A]">
                          Submitted {new Date(claim.createdAt).toLocaleString()}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {claim.status === 'ACCEPTED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            ACCEPTED
                          </span>
                        )}
                        {claim.status === 'PENDING' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">pending</span>
                            PENDING REVIEW
                          </span>
                        )}
                        {claim.status === 'FOLLOW_UP_REQUIRED' && (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-[#d2bbff] flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">help</span>
                            MORE PROOF REQUESTED
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

                    {/* Claim Initial Proof */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                        Initial Proof / Message:
                      </span>
                      <p className="text-xs text-[#e5e1e4] bg-[#121215] p-3 rounded-xl border border-white/5 leading-relaxed">
                        "{claim.proofMessage}"
                      </p>
                    </div>

                    {/* Conversation History */}
                    {claim.messages && claim.messages.length > 1 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-[11px] font-bold text-[#d2bbff] uppercase tracking-wider flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">chat</span>
                          Verification Conversation ({claim.messages.length} messages)
                        </span>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {claim.messages.map((msg, idx) => {
                            const isMsgReporter = msg.senderRole === 'reporter';
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl text-xs ${
                                  isMsgReporter
                                    ? 'bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-[#e5e1e4] ml-4'
                                    : 'bg-[#27272A]/70 border border-white/10 text-white mr-4'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-[11px] text-[#d2bbff]">
                                    {isMsgReporter ? 'You (Reporter)' : `${claim.claimantName || 'Claimant'}`}
                                  </span>
                                  <span className="text-[10px] text-[#71717A]">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="leading-relaxed">{msg.message}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Contact Details Revealed after ACCEPTED */}
                    {claim.status === 'ACCEPTED' && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg text-emerald-400">verified</span>
                          <span className="text-xs font-bold text-white">Verified Claimant Contact Details</span>
                        </div>
                        <p className="text-xs text-[#e5e1e4]">
                          Claim accepted! You can now coordinate directly with the claimant to arrange the safe return:
                        </p>
                        <div className="text-xs bg-black/40 p-3 rounded-lg border border-emerald-500/20 space-y-1 font-mono text-white">
                          <p><strong>Name:</strong> {claim.claimantName}</p>
                          <p><strong>Email:</strong> {claim.claimantEmail || 'Provided via account session'}</p>
                          {claim.claimantPhone && <p><strong>Phone:</strong> {claim.claimantPhone}</p>}
                        </div>
                      </div>
                    )}

                    {/* Inline Action Prompt (Follow-up / Reject / Accept) */}
                    {actionClaimId === (claim._id || claim.id) ? (
                      <div className="p-4 rounded-xl bg-[#121215] border border-[#7C3AED]/40 space-y-3 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {actionType === 'accept' && (
                              <>
                                <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                                Confirm Acceptance & Ownership Verification
                              </>
                            )}
                            {actionType === 'ask_proof' && (
                              <>
                                <span className="material-symbols-outlined text-sm text-[#d2bbff]">help</span>
                                Ask Claimant For Specific Additional Proof
                              </>
                            )}
                            {actionType === 'reject' && (
                              <>
                                <span className="material-symbols-outlined text-sm text-red-400">cancel</span>
                                Reject Claim (Attempt {claim.attemptNumber} of 2)
                              </>
                            )}
                          </h5>
                          <button
                            onClick={() => {
                              setActionClaimId(null);
                              setActionType(null);
                              setActionInput('');
                            }}
                            className="text-[#71717A] hover:text-white"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>

                        {actionType === 'accept' && (
                          <p className="text-xs text-[#A1A1AA]">
                            Accepting will mark this item as claimed, notify the claimant, and exchange mutual contact details for return handoff.
                          </p>
                        )}

                        <textarea
                          rows="2"
                          placeholder={
                            actionType === 'accept'
                              ? 'Optional note to claimant (e.g., Safe pickup location / available hours)...'
                              : actionType === 'ask_proof'
                              ? 'e.g. Can you describe the exact scratch mark or provide serial number on back?...'
                              : 'e.g. The details provided did not match the item markings...'
                          }
                          value={actionInput}
                          onChange={(e) => setActionInput(e.target.value)}
                          className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-xs"
                        />

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActionClaimId(null);
                              setActionType(null);
                              setActionInput('');
                            }}
                            className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleExecuteReporterAction}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all cursor-pointer shadow-md ${
                              actionType === 'accept'
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : actionType === 'reject'
                                ? 'bg-red-600 hover:bg-red-500'
                                : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
                            }`}
                          >
                            {isSubmitting ? 'Processing...' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Action Buttons (Accept, Ask for Proof, Reject) */
                      ['PENDING', 'FOLLOW_UP_REQUIRED'].includes(claim.status) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {/* 1. Accept */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionClaimId(claim._id || claim.id);
                              setActionType('accept');
                              setActionInput('');
                            }}
                            className="flex-1 min-w-[100px] py-2.5 px-3 rounded-xl bg-emerald-600/20 border border-emerald-500/50 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Accept
                          </button>

                          {/* 2. Ask for More Proof */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionClaimId(claim._id || claim.id);
                              setActionType('follow_up');
                              setActionInput('');
                            }}
                            className="flex-1 min-w-[130px] py-2.5 px-3 rounded-xl bg-[#7C3AED]/20 border border-[#7C3AED]/50 hover:bg-[#7C3AED]/30 text-[#d2bbff] font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">contact_support</span>
                            Ask for More Proof
                          </button>

                          {/* 3. Reject */}
                          <button
                            type="button"
                            onClick={() => {
                              setActionClaimId(claim._id || claim.id);
                              setActionType('reject');
                              setActionInput('');
                            }}
                            className="flex-1 min-w-[100px] py-2.5 px-3 rounded-xl bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Reject
                          </button>
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Owner Report Controls (Edit/Delete) */}
            <div className="pt-4 flex gap-3 border-t border-[#27272A]">
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
          </div>
        ) : isItemClaimed && (!myClaim || myClaim.status !== 'ACCEPTED') ? (
          /* ========================================================================= */
          /* SECTION 2: ITEM ALREADY CLAIMED BY SOMEONE ELSE                           */
          /* ========================================================================= */
          <div className="p-4 rounded-xl bg-[#18181B] border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-emerald-400">task_alt</span>
            <div>
              <p className="font-bold text-white text-sm">Item Successfully Claimed</p>
              <p className="text-[#A1A1AA] mt-0.5">
                Ownership for this item has already been verified and claimed.
              </p>
            </div>
          </div>
        ) : myClaim ? (
          /* ========================================================================= */
          /* SECTION 3: CLAIMANT ACTIVE CLAIM STATUS & LIFECYCLE                       */
          /* ========================================================================= */
          <div className="space-y-4 pt-3 border-t border-[#27272A]">
            {/* Status 1: ACCEPTED */}
            {myClaim.status === 'ACCEPTED' && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Ownership Verified!</h4>
                    <p className="text-xs text-emerald-300">The reporter has accepted your claim.</p>
                  </div>
                </div>

                <p className="text-xs text-[#e5e1e4] leading-relaxed">
                  "Claim accepted! You can now contact each other to arrange the return."
                </p>

                {/* Reporter Contact Info Box */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/20 text-xs text-white space-y-1.5 font-mono">
                  <p className="text-emerald-400 font-bold font-sans">Reporter Contact Details:</p>
                  <p><strong>Name:</strong> {myClaim.reporterName || item.reporterName || 'Item Reporter'}</p>
                  <p><strong>Email:</strong> {myClaim.reporterEmail || item.reporterEmail || 'Shared upon verification'}</p>
                  {myClaim.reporterContactDetails && (
                    <p><strong>Phone / Note:</strong> {myClaim.reporterContactDetails}</p>
                  )}
                </div>
              </div>
            )}

            {/* Status 2: PENDING (Attempt 1 or 2) */}
            {myClaim.status === 'PENDING' && (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-amber-500/30 text-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-400">hourglass_top</span>
                    <h4 className="font-bold text-white text-sm">Claim Pending Review</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Attempt {myClaim.attemptNumber} of 2
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">
                  Your ownership proof has been received and is awaiting review by the item reporter.
                </p>
                <div className="p-3 rounded-xl bg-[#121215] border border-white/5 text-xs text-[#e5e1e4]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">Your Submitted Proof:</span>
                  "{myClaim.proofMessage}"
                </div>
              </div>
            )}

            {/* Status 3: FOLLOW_UP_REQUIRED */}
            {myClaim.status === 'FOLLOW_UP_REQUIRED' && (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#7C3AED]/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#d2bbff]">
                    <span className="material-symbols-outlined text-lg">question_answer</span>
                    <h4 className="font-bold text-white text-sm">More Proof Requested by Reporter</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C3AED]/20 text-[#d2bbff] border border-[#7C3AED]/30">
                    Attempt {myClaim.attemptNumber} of 2
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-[#A1A1AA]">
                    The reporter has asked a follow-up question to verify your ownership:
                  </p>
                  {/* Latest message from reporter */}
                  {myClaim.messages && myClaim.messages.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-[#7C3AED]/15 border border-[#7C3AED]/30 text-white text-xs leading-relaxed">
                      <span className="text-[10px] text-[#d2bbff] font-bold block mb-1">
                        Reporter Question:
                      </span>
                      "{myClaim.messages[myClaim.messages.length - 1].message}"
                    </div>
                  )}
                </div>

                {/* Reply Form */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-[#ccc3d8]">
                    Your Response / Additional Proof:
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Provide specific details answering the reporter's question..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-[#121215] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-xs"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || !replyText.trim()}
                    onClick={() => handleSendReply(myClaim._id || myClaim.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs primary-glow hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {isSubmitting ? 'Sending Response...' : 'Send Response to Reporter'}
                  </button>
                </div>
              </div>
            )}

            {/* Status 4: REJECTED (Attempt 1) -> 1 Final Attempt Remaining */}
            {myClaim.status === 'REJECTED' && myClaim.attemptNumber === 1 && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-950/40 via-[#18181B] to-[#18181B] border border-red-500/40 space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <span className="material-symbols-outlined text-xl">warning</span>
                  <h4 className="font-bold text-white text-sm">Your ownership proof was not accepted</h4>
                </div>

                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200 space-y-1">
                  <p className="font-bold text-red-300">You have ONE final attempt remaining.</p>
                  <p className="text-red-200/90 text-[11px] leading-relaxed">
                    Please submit strong and specific proof of ownership. If the next request is rejected, you will no longer be able to claim this item.
                  </p>
                  {myClaim.rejectionReason && (
                    <p className="text-xs text-white pt-1 italic">
                      Reporter note: "{myClaim.rejectionReason}"
                    </p>
                  )}
                </div>

                {/* Resubmit Attempt 2 Form */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-white">
                    Submit Strong & Specific Proof (Final Attempt):
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide undeniable proof (e.g., purchase receipt details, serial numbers, specific unique markings, internal contents)..."
                    value={resubmitText}
                    onChange={(e) => setResubmitText(e.target.value)}
                    className="w-full bg-[#121215] border border-red-500/30 rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-red-400 text-xs"
                  />
                  <button
                    type="button"
                    disabled={isSubmitting || !resubmitText.trim()}
                    onClick={() => handleResubmitAttempt(myClaim._id || myClaim.id)}
                    className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg shadow-red-600/30"
                  >
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    {isSubmitting ? 'Submitting Final Attempt...' : 'Submit Final Claim Attempt'}
                  </button>
                </div>
              </div>
            )}

            {/* Status 5: FINAL_REJECTED (Permanent Block) */}
            {myClaim.status === 'FINAL_REJECTED' && (
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-red-500/30 text-zinc-300 space-y-3">
                <div className="flex items-center gap-2.5 text-red-400">
                  <span className="material-symbols-outlined text-2xl">block</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Final ownership claim rejected</h4>
                    <p className="text-xs text-zinc-400">
                      You can no longer submit another claim for this item.
                    </p>
                  </div>
                </div>
                {myClaim.rejectionReason && (
                  <p className="text-xs text-zinc-300 italic bg-black/40 p-3 rounded-xl border border-white/5">
                    "{myClaim.rejectionReason}"
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* SECTION 4: INITIAL CLAIM FORM (Claimant - Attempt 1)                      */
          /* ========================================================================= */
          <form onSubmit={handleInitialClaim} className="space-y-4 pt-2 border-t border-[#27272A]">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#ccc3d8]">
                  Why do you believe this item belongs to you?
                </label>
                <span className="text-[10px] text-[#71717A]">Attempt 1 of 2</span>
              </div>
              <textarea
                rows="3"
                required
                placeholder="Proof / Ownership Details (e.g., unique scratches, serial numbers, specific stickers, contents inside)..."
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl p-3 text-white placeholder:text-[#958da1]/50 focus:outline-none focus:border-[#7C3AED] text-xs leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A1A1AA] mb-1">
                Your Contact Phone (Optional - only shared if claim is accepted)
              </label>
              <input
                type="text"
                placeholder="+1 555 123 4567"
                value={claimantPhone}
                onChange={(e) => setClaimantPhone(e.target.value)}
                className="w-full bg-[#18181B] border border-[#3F3F46] rounded-xl px-3 py-2.5 text-white placeholder:text-[#958da1]/40 focus:outline-none focus:border-[#7C3AED] text-xs"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-[#3F3F46] text-[#e5e1e4] font-bold text-xs hover:bg-white/5 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white font-bold text-xs primary-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">verified_user</span>
                {isSubmitting ? 'Sending Request...' : 'Send Claim Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
