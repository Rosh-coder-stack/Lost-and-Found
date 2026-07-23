import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemContext';
import { useNavigation } from '../../context/NavigationContext';
import { Modal } from '../../components/common/Modal';
import { getClaimStatusBadge } from '../../utils/formatters';
import {
  User,
  ShieldCheck,
  FileCheck,
  Award,
  Upload,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  HelpCircle,
  MapPin
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { claims, updateClaimStatus } = useItems();
  const { navigateTo } = useNavigation();

  const [uploadProofModalClaim, setUploadProofModalClaim] = useState<any | null>(null);
  const [proofNote, setProofNote] = useState('');

  const myClaims = claims.filter(c => c.claimerId === currentUser.id);

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadProofModalClaim) return;
    updateClaimStatus(uploadProofModalClaim.id, 'approved', 'Proof uploaded and verified by automated lockscreen check.');
    setUploadProofModalClaim(null);
    setProofNote('');
    alert('Verification document uploaded! Claim status updated to Approved.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[#e8e7f1] p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-[#00288e]"
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1a1b22]">{currentUser.name}</h1>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-[#757684]">{currentUser.email} • {currentUser.department}</p>
            <div className="flex items-center space-x-2 pt-1 text-xs font-semibold text-[#00288e]">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{currentUser.karmaPoints} Karma Score</span>
            </div>
          </div>
        </div>

        <div className="bg-[#f4f2fc] p-4 rounded-2xl border border-[#e8e7f1] text-xs space-y-1 w-full md:w-auto text-center md:text-left">
          <p className="font-bold text-[#1a1b22]">University ID Verification</p>
          <p className="text-[#505f76]">SID: 9840-2819-UC</p>
          <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Active Student
          </span>
        </div>
      </div>

      {/* Claims Progress Tracker */}
      <div className="bg-white rounded-3xl border border-[#e8e7f1] p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#eeedf7] pb-4">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-[#00288e]" />
            <h2 className="text-lg font-black text-[#1a1b22]">My Ownership Claim Requests</h2>
          </div>
          <span className="text-xs font-bold bg-[#eeedf7] text-[#00288e] px-3 py-1 rounded-full">
            {myClaims.length} Active Requests
          </span>
        </div>

        {myClaims.length === 0 ? (
          <div className="p-8 text-center text-[#757684] space-y-2">
            <p className="text-xs font-medium">You have not submitted any property claims yet.</p>
            <button onClick={() => navigateTo('search')} className="text-xs font-bold text-[#00288e] hover:underline">
              Browse Found Valuables
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {myClaims.map((claim) => {
              const badge = getClaimStatusBadge(claim.status);
              return (
                <div key={claim.id} className="p-5 rounded-2xl border border-[#e8e7f1] bg-[#fbf8ff] space-y-4">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img src={claim.itemImage} alt={claim.itemTitle} className="w-14 h-14 object-cover rounded-xl shrink-0" />
                      <div>
                        <h3 className="font-bold text-sm text-[#1a1b22]">{claim.itemTitle}</h3>
                        <p className="text-[10px] text-[#757684]">Submitted on {claim.dateSubmitted}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bgClass} ${badge.textClass}`}>
                        {badge.text}
                      </span>
                      <button
                        onClick={() => navigateTo('item-details', claim.itemId)}
                        className="p-1.5 rounded-lg border border-[#e8e7f1] text-[#444653] hover:bg-white"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Ownership Notes */}
                  <div className="bg-white p-3 rounded-xl border border-[#e8e7f1] text-xs">
                    <p className="font-bold text-[#757684] text-[10px] uppercase">Submitted Description:</p>
                    <p className="text-[#1a1b22] mt-0.5">{claim.descriptionOfOwnership}</p>
                  </div>

                  {/* Admin Feedback Box */}
                  {claim.adminNotes && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Admin Notice:</p>
                        <p>{claim.adminNotes}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Upload Trigger */}
                  {claim.status === 'proof_requested' && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setUploadProofModalClaim(claim)}
                        className="px-4 py-2 bg-[#00288e] text-white text-xs font-bold rounded-xl hover:bg-[#1e40af] flex items-center space-x-1.5 shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Lock Screen Photo / Proof</span>
                      </button>
                    </div>
                  )}

                  {/* Approved Pickup Hub Instructions */}
                  {claim.status === 'approved' && (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Ready for Pickup!</span>
                      </div>
                      <p>
                        Present your student ID and pickup pass code <strong className="font-mono text-sm underline">{claim.pickupCode || 'CLM-7842'}</strong> at {claim.pickupLocation || 'Student Union Desk #3'}.
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof Upload Modal */}
      {uploadProofModalClaim && (
        <Modal
          isOpen={!!uploadProofModalClaim}
          onClose={() => setUploadProofModalClaim(null)}
          title="Upload Ownership Verification"
        >
          <form onSubmit={handleProofSubmit} className="space-y-4">
            <p className="text-xs text-[#505f76]">
              Please upload a photo of your receipt, serial number card, or lock screen showing your matching username.
            </p>

            <div className="border-2 border-dashed border-[#c4c5d5] hover:border-[#00288e] bg-[#f4f2fc] p-6 rounded-2xl text-center space-y-2 cursor-pointer transition-colors">
              <Upload className="w-8 h-8 text-[#00288e] mx-auto" />
              <p className="text-xs font-bold text-[#1a1b22]">Click to upload proof photo or document</p>
              <p className="text-[10px] text-[#757684]">JPG, PNG, or PDF up to 10MB</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Additional Verification Note</label>
              <textarea
                rows={2}
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
                placeholder="Optional explanation..."
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadProofModalClaim(null)}
                className="px-4 py-2 border border-[#e8e7f1] rounded-xl text-xs font-semibold text-[#444653]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00288e] text-white text-xs font-bold rounded-xl hover:bg-[#1e40af]"
              >
                Submit Proof Document
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
