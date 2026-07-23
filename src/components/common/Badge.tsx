import React from 'react';
import { ItemStatus, ItemType } from '../../types';
import { getItemStatusBadge } from '../../utils/formatters';

interface BadgeProps {
  status?: ItemStatus;
  type?: ItemType;
  customText?: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status = 'active' as ItemStatus, type = 'found' as ItemType, customText, className = '' }) => {
  if (customText) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border bg-blue-50 text-blue-700 border-blue-200 ${className}`}>
        {customText}
      </span>
    );
  }

  const { text, bgClass, textClass, borderClass } = getItemStatusBadge(status, type);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ${bgClass} ${textClass} ${borderClass} ${className}`}>
      {text}
    </span>
  );
};
