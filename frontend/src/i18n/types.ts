// Translation keys for type-safe translations
export type TranslationKey =
  // Navigation
  | 'nav.all'
  | 'nav.favorites'
  | 'nav.unlocked'
  | 'nav.profile'
  | 'nav.admin'
  
  // Page titles
  | 'page.unlockables'
  | 'page.favorites'
  | 'page.unlocked'
  | 'page.profile'
  
  // Buttons
  | 'button.watchAd'
  | 'button.view'
  | 'button.viewAd'
  | 'button.openLink'
  | 'button.goBack'
  | 'button.tryAgain'
  | 'button.claimProgress'
  | 'button.claimMyProgress'
  | 'button.save'
  
  // Stats
  | 'stats.totalItems'
  | 'stats.unlocked'
  | 'stats.favorites'
  | 'stats.progress'
  | 'stats.overallProgress'
  | 'stats.totalUnlocked'
  | 'stats.adsWatched'
  | 'stats.itemsUnlocked'
  | 'stats.unlockedBy'
  
  // Search
  | 'search.placeholder'
  | 'search.unlockables'
  | 'search.favorites'
  | 'search.unlocked'
  
  // Ad modal
  | 'ad.title'
  | 'ad.sponsored'
  | 'ad.viewed'
  | 'ad.loading'
  | 'ad.secondsRemaining'
  | 'ad.keepOpen'
  | 'ad.closedEarly'
  | 'ad.closedWindow'
  | 'ad.toContinue'
  | 'ad.earnProgress'
  | 'ad.clickToView'
  | 'ad.pleaseWait'
  | 'ad.success'
  | 'ad.canClaim'
  | 'ad.watchFor'
  | 'ad.seconds'
  
  // Empty states
  | 'empty.noUnlockables'
  | 'empty.noFavorites'
  | 'empty.noUnlocked'
  | 'empty.notFound'
  | 'empty.locked'
  | 'empty.noItems'
  
  // Content
  | 'content.photo'
  | 'content.photos'
  | 'content.link'
  | 'content.imageNotAvailable'
  | 'content.containsLink'
  | 'content.of'
  
  // Maintenance
  | 'maintenance.title'
  | 'maintenance.message'
  | 'maintenance.checkLater'
  | 'maintenance.adminNotice'
  | 'maintenance.showOverlay'
  
  // Errors
  | 'error.loading'
  | 'error.profile'
  
  // Settings
  | 'settings.language'
  | 'settings.languageAuto'
  | 'settings.languageHint';
