import type { TranslationKey } from '../types';

export const en: Record<TranslationKey, string> = {
  // Navigation
  'nav.all': 'All',
  'nav.favorites': 'Favorites',
  'nav.unlocked': 'Unlocked',
  'nav.profile': 'Profile',
  'nav.admin': 'Admin',
  
  // Page titles
  'page.unlockables': 'Unlockables',
  'page.favorites': 'Favorites',
  'page.unlocked': 'Unlocked',
  'page.profile': 'Profile',
  
  // Buttons
  'button.watchAd': 'Watch Ad',
  'button.view': 'View',
  'button.viewAd': 'View Ad',
  'button.openLink': 'Open Link',
  'button.goBack': 'Go Back',
  'button.tryAgain': 'Try Again',
  'button.claimProgress': 'Claim Progress',
  'button.claimMyProgress': 'Claim My Progress',
  'button.save': 'Save',
  
  // Stats
  'stats.totalItems': 'Total Items',
  'stats.unlocked': 'Unlocked',
  'stats.favorites': 'Favorites',
  'stats.progress': 'Progress',
  'stats.overallProgress': 'Overall Progress',
  'stats.totalUnlocked': 'Total Unlocked',
  'stats.adsWatched': 'ads',
  'stats.itemsUnlocked': 'items unlocked',
  
  // Search
  'search.placeholder': 'Search...',
  'search.unlockables': 'Search unlockables...',
  'search.favorites': 'Search favorites...',
  'search.unlocked': 'Search unlocked items...',
  
  // Ad modal
  'ad.title': 'Watch Ad to Unlock',
  'ad.sponsored': 'Sponsored Content',
  'ad.viewed': 'Ad Viewed',
  'ad.loading': 'Loading ad...',
  'ad.secondsRemaining': 's remaining',
  'ad.keepOpen': 'Do not close the ad window until the timer completes',
  'ad.closedEarly': 'Ad window closed too early. Try again!',
  'ad.closedWindow': 'Closed the ad window?',
  'ad.toContinue': 'Watch Ad to Continue',
  'ad.earnProgress': 'View the ad to earn progress',
  'ad.clickToView': 'Click below to view the ad',
  'ad.pleaseWait': 'Please wait...',
  'ad.success': 'Ad viewed successfully!',
  'ad.canClaim': 'You can now claim your progress',
  'ad.watchFor': 'Watch the ad for',
  'ad.seconds': 'seconds to earn progress',
  
  // Empty states
  'empty.noUnlockables': 'No unlockables available yet',
  'empty.noFavorites': 'No favorites yet. Tap the heart icon on any unlockable to add it here.',
  'empty.noUnlocked': 'No unlocked items yet. Watch ads to unlock content!',
  'empty.notFound': 'Content not found',
  'empty.locked': 'This content is locked',
  'empty.noItems': 'No items found',
  
  // Content
  'content.photo': 'photo',
  'content.photos': 'photos',
  'content.link': 'Link',
  'content.imageNotAvailable': 'Image not available',
  'content.containsLink': 'This unlockable contains a link',
  'content.of': 'of',
  
  // Maintenance
  'maintenance.title': 'Under Maintenance',
  'maintenance.message': 'App is under maintenance. Please check back later.',
  'maintenance.checkLater': 'Please check back later.',
  'maintenance.adminNotice': 'App is in maintenance mode. Regular users cannot access.',
  'maintenance.showOverlay': 'Show Overlay',
  
  // Errors
  'error.loading': 'Error loading content',
  'error.profile': 'Error loading profile',
  
  // Settings
  'settings.language': 'Language',
  'settings.languageAuto': 'Auto (Detect)',
  'settings.languageHint': 'Choose your preferred language or use auto-detection',
};
