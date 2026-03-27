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

export interface AppSettings {
  id: string;
  adWatchThreshold: number; // seconds required for ad to count
  adsterraUrl?: string; // Adsterra smartlink URL
  adDetectionGracePeriod?: number; // seconds to wait before showing fallback claim option
  hideTimerUI?: boolean; // hide all timer-related UI from users
  updatedAt: Date;
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
