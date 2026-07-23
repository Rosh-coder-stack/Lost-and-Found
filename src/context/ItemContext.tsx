import React, { createContext, useContext, useState, useEffect } from 'react';
import { Item, ClaimRequest, ActivityLog, FilterState } from '../types';
import {
  getStoredItems,
  saveStoredItems,
  getStoredClaims,
  saveStoredClaims,
  getStoredActivity,
  saveStoredActivity,
  filterItemsList
} from '../services/storage';

interface ItemContextType {
  items: Item[];
  claims: ClaimRequest[];
  activityLogs: ActivityLog[];
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  filteredItems: Item[];
  addItemReport: (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => Item;
  submitClaim: (claimData: Omit<ClaimRequest, 'id' | 'dateSubmitted' | 'status'>) => ClaimRequest;
  getItemById: (id: string) => Item | undefined;
  updateItemStatus: (itemId: string, status: Item['status']) => void;
  updateClaimStatus: (claimId: string, status: ClaimRequest['status'], adminNotes?: string) => void;
  deleteItem: (itemId: string) => void;
  resetFilters: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  type: 'all',
  category: 'all',
  campusZone: 'all',
  dateRange: 'all',
  sortBy: 'newest',
};

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export const ItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>(getStoredItems());
  const [claims, setClaims] = useState<ClaimRequest[]>(getStoredClaims());
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(getStoredActivity());
  const [filterState, setFilterState] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  useEffect(() => {
    saveStoredClaims(claims);
  }, [claims]);

  useEffect(() => {
    saveStoredActivity(activityLogs);
  }, [activityLogs]);

  const filteredItems = filterItemsList(items, filterState);

  const addItemReport = (itemData: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>): Item => {
    const newItem: Item = {
      ...itemData,
      id: `itm_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems(prev => [newItem, ...prev]);

    // Log activity
    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      type: 'report_created',
      title: `New ${newItem.type.toUpperCase()} Item Reported`,
      description: `${newItem.reportedBy.name} reported ${newItem.title} at ${newItem.location.building}`,
      timestamp: 'Just now',
      actorName: newItem.reportedBy.name,
      itemId: newItem.id,
      badgeType: newItem.type === 'found' ? 'info' : 'warning',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    return newItem;
  };

  const submitClaim = (claimData: Omit<ClaimRequest, 'id' | 'dateSubmitted' | 'status'>): ClaimRequest => {
    const newClaim: ClaimRequest = {
      ...claimData,
      id: `clm_${Date.now()}`,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    setClaims(prev => [newClaim, ...prev]);

    // Update item status to claim_pending
    updateItemStatus(claimData.itemId, 'claim_pending');

    const newLog: ActivityLog = {
      id: `act_${Date.now()}`,
      type: 'claim_submitted',
      title: 'Ownership Claim Submitted',
      description: `${claimData.claimerName} submitted verification proof for ${claimData.itemTitle}`,
      timestamp: 'Just now',
      actorName: claimData.claimerName,
      itemId: claimData.itemId,
      badgeType: 'warning',
    };
    setActivityLogs(prev => [newLog, ...prev]);

    return newClaim;
  };

  const getItemById = (id: string): Item | undefined => {
    return items.find(item => item.id === id);
  };

  const updateItemStatus = (itemId: string, status: Item['status']) => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, status, updatedAt: new Date().toISOString() } : item))
    );
  };

  const updateClaimStatus = (claimId: string, status: ClaimRequest['status'], adminNotes?: string) => {
    setClaims(prev =>
      prev.map(c => {
        if (c.id === claimId) {
          const updated = { ...c, status };
          if (adminNotes !== undefined) updated.adminNotes = adminNotes;
          return updated;
        }
        return c;
      })
    );
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const resetFilters = () => {
    setFilterState(DEFAULT_FILTERS);
  };

  return (
    <ItemContext.Provider
      value={{
        items,
        claims,
        activityLogs,
        filterState,
        setFilterState,
        filteredItems,
        addItemReport,
        submitClaim,
        getItemById,
        updateItemStatus,
        updateClaimStatus,
        deleteItem,
        resetFilters,
      }}
    >
      {children}
    </ItemContext.Provider>
  );
};

export const useItems = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItems must be used within an ItemProvider');
  }
  return context;
};
