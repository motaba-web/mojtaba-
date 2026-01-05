
export enum AppLanguage {
  AR = 'AR',
  EN = 'EN'
}

export enum CarCondition {
  NEW = 'NEW',
  USED = 'USED'
}

export enum ListingStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD'
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  idNumber: string;
  idImageUrl: string;
  profileImageUrl?: string; // New: editable profile photo
  email?: string;
  isVerified: boolean;
  isAdmin: boolean;
  registeredAt: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  sellerProfileImage?: string; // New: snapshot of seller's photo
  model: string;
  year: number;
  mileage: number;
  condition: CarCondition;
  price: number;
  location: string; // New: offer location
  description: string;
  images: string[];
  createdAt: number;
  status: ListingStatus;
  reportCount: number;
}

export interface Report {
  id: string;
  targetId: string; // Listing ID or User ID
  type: 'LISTING' | 'USER';
  reporterId: string;
  reason: string;
  image?: string;
  timestamp: number;
}

export interface AdminConfig {
  appNameAr: string;
  appNameEn: string;
  primaryColor: string;
  secondaryColor: string;
  m1Color: string; // New (1 m) color branding option
  logoUrl: string;
  fontFamily: string;
  commissionRate: number; // Always 0.01 (1%) as per requirements
}

export interface AppState {
  currentUser: User | null;
  listings: Listing[];
  reports: Report[];
  config: AdminConfig;
  language: AppLanguage;
  isOnline: boolean;
}
