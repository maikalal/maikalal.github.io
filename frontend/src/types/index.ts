export interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  firebaseUid?: string;
  createdAt: Date;
}

export interface Unlockable {
  id: string;
  title: string;
  description?: string;
  type: 'picture' | 'link';
  content: string[]; // Array of image URLs for pictures, or single link URL for links
  thumbnail?: string;
  adsRequired: number;
  archived?: boolean;
  createdAt: Date;
  createdBy: string;
}

export interface UserUnlockable {
  id: string;
  userId: string;
  unlockableId: string;
  adsWatched: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserFavorite {
  id: string;
  userId: string;
  unlockableId: string;
  addedAt: Date;
}

// Primary ad type options
export type PrimaryAdType = 'direct_link' | 'monetag_rewarded_interstitial' | 'monetag_rewarded_popup';

// In-App Interstitial settings for background ads
export interface MonetagInAppSettings {
  enabled: boolean;
  frequency: number; // max ads per session (1-10)
  capping: number; // session duration in hours (0.1-24)
  interval: number; // seconds between ads (30-300)
  timeout: number; // delay before first ad in seconds (5-60)
  everyPage: boolean; // reset session on page reload
}

export interface AppSettings {
  id: string;
  adWatchThreshold: number; // seconds required for ad to count
  adDetectionGracePeriod?: number; // seconds to wait before showing fallback claim option
  hideTimerUI?: boolean; // hide all timer-related UI from users
  updatedAt: Date;
  
  // Primary ad configuration
  primaryAdType: PrimaryAdType;
  
  // Direct link config (works with any ad network: Adsterra, Monetag direct links, etc.)
  directLinkUrl?: string;
  
  // Monetag SDK config
  monetagZoneId?: string; // Main zone ID from Monetag dashboard
  monetagYmid?: string; // Optional: user/event tracking ID for postbacks
  monetagRequestVar?: string; // Optional: placement tracking for analytics
  monetagPreloadEnabled?: boolean; // Preload ads for faster display
  monetagTimeout?: number; // Seconds to wait for ad load (default: 5)
  
  // In-App Interstitial (background ads - runs alongside primary)
  monetagInApp?: MonetagInAppSettings;
  
  // Legacy field for backward compatibility
  adsterraUrl?: string; // Deprecated: use directLinkUrl instead
}

export interface AdminStats {
  totalUsers: number;
  totalUnlockables: number;
  activeUnlockables: number;
  archivedUnlockables: number;
  totalAdsWatched: number;
  totalUnlocked: number;
  adminCount: number;
}
