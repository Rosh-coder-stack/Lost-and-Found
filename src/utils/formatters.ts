import { ItemStatus, ItemType, ClaimStatus } from '../types';

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTimeAgo(isoString: string): string {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(isoString);
}

export function getItemStatusBadge(status: ItemStatus, type: ItemType): { text: string; bgClass: string; textClass: string; borderClass: string } {
  if (status === 'resolved') {
    return {
      text: 'RESOLVED',
      bgClass: 'bg-emerald-50',
      textClass: 'text-emerald-700',
      borderClass: 'border-emerald-200',
    };
  }
  if (status === 'claim_pending') {
    return {
      text: 'CLAIM PENDING',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-200',
    };
  }
  if (status === 'flagged') {
    return {
      text: 'NEEDS REVIEW',
      bgClass: 'bg-rose-50',
      textClass: 'text-rose-700',
      borderClass: 'border-rose-200',
    };
  }
  
  if (type === 'found') {
    return {
      text: 'FOUND',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
    };
  }
  
  return {
    text: 'LOST',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
  };
}

export function getClaimStatusBadge(status: ClaimStatus): { text: string; bgClass: string; textClass: string } {
  switch (status) {
    case 'approved':
      return { text: 'APPROVED', bgClass: 'bg-emerald-100', textClass: 'text-emerald-800' };
    case 'proof_requested':
      return { text: 'PROOF NEEDED', bgClass: 'bg-amber-100', textClass: 'text-amber-900' };
    case 'rejected':
      return { text: 'REJECTED', bgClass: 'bg-rose-100', textClass: 'text-rose-800' };
    case 'resolved':
      return { text: 'COMPLETED', bgClass: 'bg-blue-100', textClass: 'text-blue-800' };
    default:
      return { text: 'PENDING REVIEW', bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
  }
}

export function getCategoryIconName(category: string): string {
  switch (category) {
    case 'Electronics':
      return 'laptop_mac';
    case 'Keys & Cards':
      return 'key';
    case 'Eyewear':
      return 'eyeglasses';
    case 'Bottles & Containers':
      return 'water_bottle';
    case 'Audio':
      return 'headphones';
    case 'Wallets & Bags':
      return 'wallet';
    case 'Stationery & Study':
      return 'calculate';
    case 'Apparel & Accessories':
      return 'apparel';
    default:
      return 'inventory_2';
  }
}
