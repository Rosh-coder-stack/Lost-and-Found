import { Item, ClaimRequest, ActivityLog, User, FilterState } from '../types';
import { INITIAL_ITEMS, INITIAL_CLAIMS, INITIAL_ACTIVITY, INITIAL_USERS } from '../utils/constants';

const ITEMS_KEY = 'campus_lost_found_items_v2';
const CLAIMS_KEY = 'campus_lost_found_claims_v2';
const ACTIVITY_KEY = 'campus_lost_found_activity_v2';
const USERS_KEY = 'campus_lost_found_users_v2';

export function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: Item[]): void {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save items', e);
  }
}

export function getStoredClaims(): ClaimRequest[] {
  try {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) {
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(INITIAL_CLAIMS));
      return INITIAL_CLAIMS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CLAIMS;
  }
}

export function saveStoredClaims(claims: ClaimRequest[]): void {
  try {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
  } catch (e) {
    console.error('Failed to save claims', e);
  }
}

export function getStoredActivity(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(INITIAL_ACTIVITY));
      return INITIAL_ACTIVITY;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ACTIVITY;
  }
}

export function saveStoredActivity(activity: ActivityLog[]): void {
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
  } catch (e) {
    console.error('Failed to save activity', e);
  }
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function filterItemsList(items: Item[], filter: FilterState): Item[] {
  return items.filter(item => {
    // Type filter
    if (filter.type !== 'all' && item.type !== filter.type) return false;
    
    // Category filter
    if (filter.category !== 'all' && item.category !== filter.category) return false;

    // Campus zone filter
    if (filter.campusZone !== 'all' && item.location.campusZone !== filter.campusZone) return false;

    // Search query filter
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchBuilding = item.location.building.toLowerCase().includes(q);
      const matchTags = item.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchBuilding && !matchTags) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filter.sortBy === 'oldest') {
      return new Date(a.dateReported).getTime() - new Date(b.dateReported).getTime();
    }
    return new Date(b.dateReported).getTime() - new Date(a.dateReported).getTime();
  });
}
