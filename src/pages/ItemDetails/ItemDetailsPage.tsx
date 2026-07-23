import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useItems } from '../../context/ItemContext';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { BoundingMapWidget } from '../../components/ui/BoundingMapWidget';
import { formatDate } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  Mail,
  UserCheck,
  Building,
  Tag,
  Share2,
  CheckCircle2,
  ShieldAlert,
  Send
} from 'lucide-react';

export const ItemDetailsPage: React.FC = () => {
  const { selectedItemId, navigateTo } = useNavigation();
  const { getItemById, submitClaim } = useItems();
  const { currentUser } = useAuth();

  const item = getItemById(selectedItemId || 'itm_001');

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState('');

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#1a1b22]">Item Listing Not Found</h2>
        <button onClick={() => navigateTo('search')} className="px-4 py-2 bg-[#00288e] text-white rounded-xl text-xs font-bold">
          Return to Search Catalog
        </button>
      </div>
    );
  }

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitClaim({
      itemId: item.id,
      itemTitle: item.title,
      itemImage: item.imageUrl,
      claimerId: currentUser.id,
      claimerName: currentUser.name,
      claimerEmail: currentUser.email,
      claimerAvatar: currentUser.avatarUrl,
      descriptionOfOwnership: claimReason,
    });
    setClaimModalOpen(false);
    setClaimReason('');
    alert('Ownership verification submitted! Redirecting to your claims tracker...');
    navigateTo('profile');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Message sent to ${item.reportedBy.name}! Check your university email for updates.`);
    setMessageModalOpen(false);
    setMessageText('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Navigation Back Action */}
      <div className="flex items-center justify-between border-b border-[#eeedf7] pb-4">
        <button
          onClick={() => navigateTo('search')}
          className="flex items-center space-x-1.5 text-xs font-bold text-[#00288e] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search Catalog</span>
        </button>

        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Item link copied to clipboard!'); }}
          className="flex items-center space-x-1 text-xs text-[#505f76] hover:text-[#00288e]"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share Link</span>
        </button>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: High-Res Photo Display */}
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden border border-[#e8e7f1] bg-[#f4f2fc] h-80 sm:h-96 shadow-xs">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge status={item.status} type={item.type} />
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-[#1a1b22] border border-white/40">
              Ref ID: #{item.id.toUpperCase()}
            </div>
          </div>

          {/* Storage & Custody Note */}
          <div className="bg-[#f4f2fc] p-4 rounded-2xl border border-[#e8e7f1] flex items-start space-x-3 text-xs">
            <ShieldCheck className="w-5 h-5 text-[#00288e] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#1a1b22]">Safe Storage / Location Desk</p>
              <p className="text-[#505f76] mt-0.5">{item.storageLocation || 'Reported to Student Union Desk #3'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Actions */}
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#757684] mb-1">
              <Tag className="w-3.5 h-3.5 text-[#00288e]" />
              <span className="font-semibold">{item.category}</span>
              <span>•</span>
              <span>{item.type.toUpperCase()} ITEM</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a1b22] leading-tight">{item.title}</h1>
          </div>

          {/* Key Facts List */}
          <div className="space-y-3 bg-white p-4 rounded-2xl border border-[#e8e7f1] text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#eeedf7]">
              <span className="text-[#757684] font-medium flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#00288e]" />
                <span>Location:</span>
              </span>
              <span className="font-bold text-[#1a1b22]">{item.location.building} ({item.location.roomOrArea || 'General Area'})</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#eeedf7]">
              <span className="text-[#757684] font-medium flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#757684]" />
                <span>Date Discovered:</span>
              </span>
              <span className="font-bold text-[#1a1b22]">{formatDate(item.dateReported)}</span>
            </div>

            {item.primaryColor && (
              <div className="flex items-center justify-between py-1 border-b border-[#eeedf7]">
                <span className="text-[#757684] font-medium">Color / Finish:</span>
                <span className="font-bold text-[#1a1b22]">{item.primaryColor}</span>
              </div>
            )}

            <div className="flex items-center justify-between py-1">
              <span className="text-[#757684] font-medium flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Reported By:</span>
              </span>
              <span className="font-bold text-[#00288e]">{item.reportedBy.name}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#1a1b22] uppercase tracking-wider mb-2">Description</h3>
            <p className="text-xs text-[#505f76] leading-relaxed bg-[#fbf8ff] p-4 rounded-2xl border border-[#e8e7f1]">
              {item.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {item.type === 'found' && item.status === 'active' && (
              <button
                onClick={() => setClaimModalOpen(true)}
                className="w-full sm:flex-1 py-3 bg-[#00288e] text-white font-bold text-xs rounded-xl hover:bg-[#1e40af] transition-colors flex items-center justify-center space-x-2 shadow-xs"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Claim This Item (This is Mine!)</span>
              </button>
            )}

            <button
              onClick={() => setMessageModalOpen(true)}
              className="w-full sm:w-auto px-5 py-3 border border-[#e8e7f1] bg-white text-[#1a1b22] font-bold text-xs rounded-xl hover:bg-[#f4f2fc] transition-colors flex items-center justify-center space-x-2"
            >
              <Mail className="w-4 h-4 text-[#00288e]" />
              <span>Contact Finder</span>
            </button>
          </div>

        </div>

      </div>

      {/* Campus Map Pin Detail */}
      <div className="bg-white p-6 rounded-3xl border border-[#e8e7f1] space-y-4">
        <h3 className="font-black text-base text-[#1a1b22]">Found Location Pin</h3>
        <BoundingMapWidget selectedBuilding={item.location.building} interactive={false} />
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <Modal isOpen={claimModalOpen} onClose={() => setClaimModalOpen(false)} title="Verify Ownership">
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <p className="text-xs text-[#505f76]">
              To protect student property, please describe unique identifying details that match this {item.title}.
            </p>
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Ownership Proof Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={claimReason}
                onChange={(e) => setClaimReason(e.target.value)}
                placeholder="Describe lock screen photo, serial number, scratch on back, or contents inside..."
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setClaimModalOpen(false)}
                className="px-4 py-2 border border-[#e8e7f1] rounded-xl text-xs font-semibold text-[#444653]"
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

      {/* Message Modal */}
      {messageModalOpen && (
        <Modal isOpen={messageModalOpen} onClose={() => setMessageModalOpen(false)} title={`Message ${item.reportedBy.name}`}>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Your Message</label>
              <textarea
                required
                rows={3}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ask about pickup hours or desk location..."
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setMessageModalOpen(false)}
                className="px-4 py-2 border border-[#e8e7f1] rounded-xl text-xs font-semibold text-[#444653]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00288e] text-white text-xs font-bold rounded-xl hover:bg-[#1e40af] flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};
