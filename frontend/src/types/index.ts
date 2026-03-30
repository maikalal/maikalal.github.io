export interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  role: 'user' | 'admin';
  firebaseUid?: string;
  preferredLanguage?: SupportedLanguage | null;  // User's manual language choice (overrides detection)
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
  unlockCount?: number;    // Number of users who unlocked this item
  favoriteCount?: number;  // Number of users who favorited this item
  createdAt: Date;
  createdBy: string;
}

export interface UserUnlockable {
  id: string;              // unlockableId (doc ID in subcollection)
  unlockableId: string;    // Same as id, kept for backward compatibility
  adsRequired: number;    // Denormalized for security rule enforcement
  adsWatched: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserFavorite {
  id: string;              // unlockableId (doc ID in subcollection)
  unlockableId: string;    // Same as id, kept for backward compatibility
  addedAt: Date;
}

// Primary ad type options
export type PrimaryAdType = 'direct_link' | 'monetag_rewarded_interstitial' | 'monetag_rewarded_popup';

// Supported languages
export type SupportedLanguage = 'en' | 'bn';

// Language settings for auto-detection
export interface LanguageSettings {
  defaultLanguage: SupportedLanguage;           // Fallback when detection fails
  autoDetectLanguage: boolean;                  // Enable auto-detection from Telegram
  supportedLanguages: SupportedLanguage[];      // Available languages
  forceLanguage?: SupportedLanguage | null;     // Admin can force a language (overrides detection)
  enableIpDetection?: boolean;                  // Enable IP-based geolocation detection
  // Language mapping is developer-managed in i18n/constants.ts
}

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
  
  // Maintenance mode
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  maintenanceAllowAdmins?: boolean; // Allow admins to bypass (default: true)
  
  // Language settings
  languageSettings?: LanguageSettings;
  
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
