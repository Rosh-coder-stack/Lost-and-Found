import React, { useState } from 'react';
import { MapPin, Navigation, Info, Layers } from 'lucide-react';
import { CAMPUS_BUILDINGS } from '../../utils/constants';

interface BoundingMapWidgetProps {
  selectedBuilding?: string;
  onSelectBuilding?: (building: string) => void;
  interactive?: boolean;
}

export const BoundingMapWidget: React.FC<BoundingMapWidgetProps> = ({
  selectedBuilding = 'Science & Engineering Library',
  onSelectBuilding,
  interactive = true,
}) => {
  const [activeBuilding, setActiveBuilding] = useState(selectedBuilding);

  const handleBuildingClick = (b: string) => {
    setActiveBuilding(b);
    if (onSelectBuilding) onSelectBuilding(b);
  };

  return (
    <div className="relative rounded-2xl border border-[#e8e7f1] overflow-hidden shadow-xs bg-[#eeedf7] group">
      
      {/* Map Graphic Container */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVJd6oUhHBizN9YL7AgqWSowlv8FZYTWwl-iyZuklobA3T2Y3toJG0A_Oh_BOXuWFvHTm12yvDnfzIZlp9LjHmmTZRVHaZy4RnTgB_XczlG6VUnCM_7JGBobjEcf1olNlyZBlTeNy85b3U0ttTwfddo66Dh-sSH-MLMlOr1lAEspItlqgMn2kGX7mQ4sTmmNmZQSGY0DYfhyIG7dKtNO6WPrPrNISCEdLPW8Jjc_0F-SCa7W3yVkjvsP5jReHasxeZwvtewXzg0Z4')` }}>
        
        {/* Overlay Dark Blur Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

        {/* Floating Building Pin Badges on Map */}
        <div className="absolute inset-0 p-4 flex flex-wrap content-around justify-around">
          {CAMPUS_BUILDINGS.slice(0, 5).map((b, idx) => {
            const isSelected = activeBuilding === b;
            return (
              <button
                key={b}
                onClick={() => interactive && handleBuildingClick(b)}
                className={`m-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-[#00288e] text-white ring-2 ring-white scale-105'
                    : 'bg-white/90 text-[#1a1b22] hover:bg-white hover:scale-100'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-[#00288e]'}`} />
                <span>{b}</span>
              </button>
            );
          })}
        </div>

        {/* Map Header Overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-[#1a1b22] flex items-center space-x-2 border border-white/40 shadow-xs">
          <Navigation className="w-4 h-4 text-[#00288e]" />
          <span>Campus Geo Zone</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-[#505f76] flex items-center space-x-1 border border-white/40 shadow-xs">
          <Layers className="w-3.5 h-3.5 text-[#00288e]" />
          <span>Interactive Grid</span>
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-8 h-8 rounded-lg bg-[#00288e]/10 text-[#00288e] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#1a1b22] truncate">{activeBuilding}</p>
              <p className="text-[10px] text-[#757684]">Primary lost & found verification zone</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              GPS Verified
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
