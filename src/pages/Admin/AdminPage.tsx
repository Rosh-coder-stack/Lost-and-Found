import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemContext';
import { useNavigation } from '../../context/NavigationContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Users,
  Search,
  Filter,
  Check,
  X,
  FileCheck,
  Settings,
  ShieldAlert
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { items, claims, deleteItem, updateItemStatus, updateClaimStatus } = useItems();
  const { navigateTo } = useNavigation();

  const [activeTab, setActiveTab] = useState<'moderation' | 'claims' | 'users'>('moderation');
  const [adminSearch, setAdminSearch] = useState('');

  const pendingClaims = claims.filter(c => c.status === 'pending' || c.status === 'proof_requested');
  const flaggedItems = items.filter(i => i.status === 'flagged' || i.type === 'found');

  const handleApproveClaim = (claimId: string) => {
    updateClaimStatus(claimId, 'approved', 'Verified by Admin office. Pickup pass generated.');
    alert('Claim approved! Student notified with pickup pass code.');
  };

  const handleRejectClaim = (claimId: string) => {
    updateClaimStatus(claimId, 'rejected', 'Insufficient proof of ownership provided.');
    alert('Claim rejected.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <Sidebar activeTab="review" onSelectTab={(t) => setActiveTab(t as any)} />

        {/* Main Admin Console */}
        <div className="flex-1 space-y-8">
          
          {/* Admin Header Banner */}
          <div className="bg-[#1a1b22] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#444653]/40">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black">Campus Moderation Console</h1>
                <p className="text-xs text-[#c4c5d5] mt-1">Logged in as {currentUser.name} (Campus Safety Officer)</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('moderation')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'moderation' ? 'bg-amber-500 text-white' : 'bg-[#444653]/40 text-[#c4c5d5] hover:bg-[#444653]'
                }`}
              >
                Catalog Items
              </button>
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'claims' ? 'bg-amber-500 text-white' : 'bg-[#444653]/40 text-[#c4c5d5] hover:bg-[#444653]'
                }`}
              >
                Claims Queue ({pendingClaims.length})
              </button>
            </div>
          </div>

          {/* Admin Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Active System Items"
              value={items.length}
              change="Catalog Live"
              icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
              description="Indexed items"
            />
            <StatCard
              title="Pending Claim Verification"
              value={pendingClaims.length}
              change="Needs Action"
              changeType="negative"
              icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
              description="Awaiting admin review"
            />
            <StatCard
              title="Successful Returns"
              value={claims.filter(c => c.status === 'approved' || c.status === 'resolved').length + 14}
              change="98% Accuracy"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              description="Returned to owners"
            />
          </div>

          {/* Tab 1: Claims Review Queue */}
          {activeTab === 'claims' && (
            <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
                <h3 className="font-black text-base text-[#1a1b22]">Pending Claims Review</h3>
                <span className="text-xs text-[#757684]">Requires ownership confirmation</span>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="p-8 text-center text-[#757684]">
                  <p className="text-xs font-medium">All student claim requests have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-[#eeedf7]">
                  {pendingClaims.map(claim => (
                    <div key={claim.id} className="pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={claim.itemImage} alt={claim.itemTitle} className="w-12 h-12 object-cover rounded-xl" />
                          <div>
                            <p className="font-bold text-xs text-[#1a1b22]">{claim.itemTitle}</p>
                            <p className="text-[10px] text-[#757684]">Claimer: {claim.claimerName} ({claim.claimerEmail})</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveClaim(claim.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Issue Pass</span>
                          </button>
                          <button
                            onClick={() => handleRejectClaim(claim.id)}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 flex items-center space-x-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#f4f2fc] p-3 rounded-xl text-xs text-[#444653]">
                        <p className="font-bold text-[#757684] text-[10px] uppercase">Submitted Proof:</p>
                        <p className="italic">"{claim.descriptionOfOwnership}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Catalog Moderation */}
          {activeTab === 'moderation' && (
            <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
                <h3 className="font-black text-base text-[#1a1b22]">System Catalog Moderation</h3>
                <span className="text-xs text-[#757684]">Manage all reported lost & found items</span>
              </div>

              <div className="divide-y divide-[#eeedf7]">
                {items.map(item => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 truncate">
                      <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-cover rounded-xl shrink-0" />
                      <div className="truncate">
                        <p
                          onClick={() => navigateTo('item-details', item.id)}
                          className="font-bold text-xs text-[#1a1b22] hover:text-[#00288e] cursor-pointer truncate"
                        >
                          {item.title}
                        </p>
                        <p className="text-[10px] text-[#757684]">
                          {item.type.toUpperCase()} • {item.location.building} • Reported by {item.reportedBy.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Badge status={item.status} type={item.type} />
                      <button
                        onClick={() => { deleteItem(item.id); alert('Item deleted from catalog.'); }}
                        className="p-1.5 rounded-lg border border-[#e8e7f1] text-rose-600 hover:bg-rose-50"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
