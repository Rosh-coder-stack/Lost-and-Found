import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Shield, PhoneCall, MapPin, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();

  return (
    <footer className="bg-[#1a1b22] text-[#e3e1eb] pt-12 pb-16 border-t border-[#444653]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#1e40af] flex items-center justify-center text-white font-bold">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                CAMPUS LOST & FOUND
              </span>
            </div>
            <p className="text-xs text-[#c4c5d5] leading-relaxed">
              Official university portal connecting students, faculty, and campus security to safely return lost items.
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-950/50 border border-amber-800/50 p-2.5 rounded-xl">
              <Shield className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Campus Police Verified Lost & Found System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wider uppercase">Quick Access</h4>
            <ul className="space-y-2.5 text-xs text-[#c4c5d5]">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-white transition-colors">
                  Home Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('search')} className="hover:text-white transition-colors">
                  Search & Filter Items
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('report-found')} className="hover:text-white transition-colors">
                  Report a Found Item
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('report-lost')} className="hover:text-white transition-colors">
                  Report a Lost Valuable
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('dashboard')} className="hover:text-white transition-colors">
                  Student Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Pickup Hubs */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wider uppercase">Main Pickup Hubs</h4>
            <ul className="space-y-2.5 text-xs text-[#c4c5d5]">
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Student Union Desk (MLK Jr. Hall Rm 110)</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Science Library Info Counter</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Recreation Center Front Office</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Campus Safety Office (24/7 Dispatch)</span>
              </li>
            </ul>
          </div>

          {/* Emergency & Dispatch */}
          <div>
            <h4 className="font-bold text-sm text-white mb-4 tracking-wider uppercase">24/7 Safety Dispatch</h4>
            <div className="bg-[#444653]/20 border border-[#444653]/40 p-4 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-xs text-[#e8e7f1]">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-mono font-bold text-sm text-emerald-400">(555) 019-2834</span>
              </div>
              <p className="text-[11px] text-[#c4c5d5]">
                For urgent retrieval of government IDs, keys, or high-value items after office hours.
              </p>
              <a
                href="#campus-safety"
                onClick={(e) => { e.preventDefault(); alert('Redirecting to Campus Safety Services hotline'); }}
                className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:underline"
              >
                <span>Safety Guidelines</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-[#444653]/40 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#757684]">
          <p>© 2025 University Campus Services. Built for student life.</p>
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Honor Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
