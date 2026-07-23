export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'Electronics'
  | 'Keys & Cards'
  | 'Eyewear'
  | 'Bottles & Containers'
  | 'Audio'
  | 'Wallets & Bags'
  | 'Stationery & Study'
  | 'Apparel & Accessories'
  | 'Other';

export type ItemStatus = 'active' | 'claim_pending' | 'resolved' | 'flagged' | 'archived';

export interface LocationInfo {
  building: string;
  roomOrArea?: string;
  campusZone: 'North Campus' | 'Central Quad' | 'South Campus' | 'Science & Engineering' | 'Library Complex' | 'Student Union' | 'Athletic Center';
  lat?: number;
  lng?: number;
}

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  type: ItemType;
  status: ItemStatus;
  description: string;
  primaryColor?: string;
  brand?: string;
  location: LocationInfo;
  dateReported: string; // ISO string or format YYYY-MM-DD
  timeReported?: string;
  imageUrl: string;
  additionalImages?: string[];
  reportedBy: {
    id: string;
    name: string;
    avatarUrl: string;
    email: string;
    role: 'student' | 'faculty' | 'staff' | 'admin';
  };
  contactPreference?: 'email' | 'phone' | 'in_app';
  storageLocation?: string; // e.g., 'Student Union Desk #3'
  secretQuestions?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 'pending' | 'proof_requested' | 'approved' | 'rejected' | 'resolved';

export interface ClaimRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  claimerId: string;
  claimerName: string;
  claimerEmail: string;
  claimerAvatar: string;
  dateSubmitted: string;
  status: ClaimStatus;
  descriptionOfOwnership: string;
  proofDocumentUrl?: string;
  adminNotes?: string;
  pickupLocation?: string;
  pickupCode?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'student' | 'faculty' | 'staff' | 'admin';
  department?: string;
  karmaPoints: number;
  itemsReportedCount: number;
  itemsResolvedCount: number;
  responseRate: string;
  isVerified: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'report_created' | 'claim_submitted' | 'item_resolved' | 'flagged' | 'moderation_action';
  title: string;
  description: string;
  timestamp: string;
  actorName: string;
  itemId?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'error';
}

export interface FilterState {
  searchQuery: string;
  type: 'all' | 'lost' | 'found';
  category: ItemCategory | 'all';
  campusZone: string | 'all';
  dateRange: 'all' | 'today' | 'this_week' | 'this_month';
  sortBy: 'newest' | 'oldest' | 'relevance';
}

export type RoutePage = 
  | 'home'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'report-lost'
  | 'report-found'
  | 'item-details'
  | 'search'
  | 'profile'
  | 'admin';
