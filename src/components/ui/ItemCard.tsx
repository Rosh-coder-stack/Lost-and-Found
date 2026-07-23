import React, { useState } from 'react';
import { Item } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { Badge } from '../common/Badge';
import { formatDate, getCategoryIconName } from '../../utils/formatters';
import { MapPin, Calendar, Bookmark, ArrowUpRight, ShieldAlert } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onClaimClick?: (item: Item) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClaimClick }) => {
  const { navigateTo } = useNavigation();
  const [bookmarked, setBookmarked] = useState(false);

  const isFound = item.type === 'found';
  const categoryIcon = getCategoryIconName(item.category);

  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
      
      {/* Image & Badges Banner */}
      <div className="relative h-48 bg-[#f4f2fc] overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex items-center space-x-1">
          <Badge status={item.status} type={item.type} />
        </div>

        {/* Bookmark Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setBookmarked(!bookmarked);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
            bookmarked ? 'bg-amber-500 text-white' : 'bg-white/80 text-[#444653] hover:bg-white'
          }`}
          title={bookmarked ? 'Remove Bookmark' : 'Save Item'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Category Chip */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-[#1a1b22] px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-2xs">
          <span className="material-symbols-outlined text-sm text-[#00288e]">{categoryIcon}</span>
          <span>{item.category}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => navigateTo('item-details', item.id)}
            className="font-bold text-base text-[#1a1b22] group-hover:text-[#00288e] transition-colors cursor-pointer line-clamp-1"
          >
            {item.title}
          </h3>
          <p className="text-xs text-[#505f76] line-clamp-2 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Location & Date Metadata */}
        <div className="space-y-1.5 pt-2 border-t border-[#eeedf7] text-xs text-[#757684]">
          <div className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#00288e] shrink-0" />
            <span className="truncate font-medium text-[#1a1b22]">{item.location.building}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#757684] shrink-0" />
              <span>{formatDate(item.dateReported)}</span>
            </div>
            {item.primaryColor && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f2fc] text-[#444653] font-medium">
                {item.primaryColor}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            onClick={() => navigateTo('item-details', item.id)}
            className="flex-1 py-2 px-3 rounded-xl border border-[#e8e7f1] text-xs font-semibold text-[#1a1b22] hover:bg-[#f4f2fc] transition-colors flex items-center justify-center space-x-1"
          >
            <span>View Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          {isFound && item.status === 'active' && (
            <button
              onClick={() => onClaimClick ? onClaimClick(item) : navigateTo('item-details', item.id)}
              className="py-2 px-3 rounded-xl bg-[#00288e] text-white text-xs font-bold hover:bg-[#1e40af] transition-colors flex items-center space-x-1 shadow-xs"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>This is Mine!</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
