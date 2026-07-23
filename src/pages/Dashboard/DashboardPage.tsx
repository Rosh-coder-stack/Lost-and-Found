import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItems } from '../../context/ItemContext';
import { useNavigation } from '../../context/NavigationContext';
import { Sidebar } from '../../components/layout/Sidebar';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  PlusCircle,
  AlertTriangle,
  FileCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { items, claims, activityLogs } = useItems();
  const { navigateTo } = useNavigation();

  const userItems = items.filter(i => i.reportedBy.id === currentUser.id);
  const userClaims = claims.filter(c => c.claimerId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <Sidebar activeTab="overview" />

        {/* Main Dashboard Content */}
        <div className="flex-1 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#00288e] to-[#1e40af] text-white rounded-3xl p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-sm"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl sm:text-2xl font-black">{currentUser.name}</h1>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-1">{currentUser.department} • {currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                onClick={() => navigateTo('report-found')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white text-[#00288e] text-xs font-bold hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Found</span>
              </button>
              <button
                onClick={() => navigateTo('report-lost')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors flex items-center justify-center space-x-1"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Report Lost</span>
              </button>
            </div>
          </div>

          {/* Metric Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Items Reported"
              value={userItems.length}
              change="+1 this week"
              icon={<PlusCircle className="w-5 h-5" />}
              description="Your logged items"
            />
            <StatCard
              title="Active Claims"
              value={userClaims.length}
              change="Under Review"
              changeType="neutral"
              icon={<FileCheck className="w-5 h-5" />}
              description="Pending verification"
            />
            <StatCard
              title="Karma Points"
              value={currentUser.karmaPoints}
              change="+30 pts"
              icon={<Award className="w-5 h-5 text-amber-500" />}
              description="Campus trust badge"
            />
            <StatCard
              title="Response Rate"
              value={currentUser.responseRate}
              change="Top 5%"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              description="Average reply < 10 mins"
            />
          </div>

          {/* Activity Feed & User My Reports Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: My Active Reports */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e8e7f1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
                <h3 className="font-black text-base text-[#1a1b22]">My Reported Listings</h3>
                <button onClick={() => navigateTo('search')} className="text-xs font-bold text-[#00288e] hover:underline">
                  Browse All Catalog
                </button>
              </div>

              {userItems.length === 0 ? (
                <div className="p-8 text-center text-[#757684] space-y-2">
                  <p className="text-xs font-medium">You haven't submitted any lost or found reports yet.</p>
                  <button
                    onClick={() => navigateTo('report-found')}
                    className="text-xs font-bold text-[#00288e] hover:underline"
                  >
                    Report your first found item
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#eeedf7]">
                  {userItems.map(item => (
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
                          <p className="text-[10px] text-[#757684]">{item.location.building} • {formatDate(item.dateReported)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <Badge status={item.status} type={item.type} />
                        <button
                          onClick={() => navigateTo('item-details', item.id)}
                          className="p-1.5 rounded-lg border border-[#e8e7f1] text-[#444653] hover:bg-[#f4f2fc]"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Campus Live Activity Feed */}
            <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeedf7]">
                <h3 className="font-black text-base text-[#1a1b22]">Live Activity Feed</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Realtime
                </span>
              </div>

              <div className="space-y-4">
                {activityLogs.slice(0, 5).map(act => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-8 h-8 rounded-full bg-[#f4f2fc] text-[#00288e] flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#1a1b22]">{act.title}</p>
                      <p className="text-[#505f76] text-[11px] mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-[#757684]">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
