import type { TranslationKey } from '../types';

export const bn: Record<TranslationKey, string> = {
  // Navigation
  'nav.all': 'সব',
  'nav.favorites': 'পছন্দ',
  'nav.unlocked': 'আনলক',
  'nav.profile': 'প্রোফাইল',
  'nav.admin': 'Admin',
  
  // Page titles
  'page.unlockables': 'কন্টেন্ট',
  'page.favorites': 'পছন্দের তালিকা',
  'page.unlocked': 'আনলক করা',
  'page.profile': 'প্রোফাইল',
  
  // Buttons
  'button.watchAd': 'বিজ্ঞাপন দেখুন',
  'button.view': 'দেখুন',
  'button.viewAd': 'বিজ্ঞাপন দেখুন',
  'button.openLink': 'লিংক খুলুন',
  'button.goBack': 'ফিরে যান',
  'button.tryAgain': 'আবার চেষ্টা করুন',
  'button.claimProgress': 'প্রগ্রেস নিন',
  'button.claimMyProgress': 'প্রগ্রেস নিন',
  'button.save': 'সেভ করুন',
  
  // Stats
  'stats.totalItems': 'মোট আইটেম',
  'stats.unlocked': 'আনলক',
  'stats.favorites': 'পছন্দ',
  'stats.progress': 'প্রগ্রেস',
  'stats.overallProgress': 'সামগ্রিক প্রগ্রেস',
  'stats.totalUnlocked': 'মোট আনলক',
  'stats.adsWatched': 'টি বিজ্ঞাপন',
  'stats.itemsUnlocked': 'টি আইটেম আনলক হয়েছে',
  
  // Search
  'search.placeholder': 'খুঁজুন...',
  'search.unlockables': 'কন্টেন্ট খুঁজুন...',
  'search.favorites': 'পছন্দের মধ্যে খুঁজুন...',
  'search.unlocked': 'আনলক করা খুঁজুন...',
  
  // Ad modal
  'ad.title': 'আনলক করতে বিজ্ঞাপন দেখুন',
  'ad.sponsored': 'স্পনসরড কন্টেন্ট',
  'ad.viewed': 'বিজ্ঞাপন দেখা হয়েছে',
  'ad.loading': 'বিজ্ঞাপন লোড হচ্ছে...',
  'ad.secondsRemaining': 'সেকেন্ড বাকি',
  'ad.keepOpen': 'টাইমার শেষ হওয়া পর্যন্ত বিজ্ঞাপন উইন্ডো বন্ধ করবেন না',
  'ad.closedEarly': 'বিজ্ঞাপন আগেই বন্ধ হয়েছে। আবার চেষ্টা করুন!',
  'ad.closedWindow': 'বিজ্ঞাপন উইন্ডো বন্ধ করেছেন?',
  'ad.toContinue': 'চালিয়ে যেতে বিজ্ঞাপন দেখুন',
  'ad.earnProgress': 'প্রগ্রেস অর্জন করতে বিজ্ঞাপন দেখুন',
  'ad.clickToView': 'বিজ্ঞাপন দেখতে নিচে ক্লিক করুন',
  'ad.pleaseWait': 'অনুগ্রহ করে অপেক্ষা করুন...',
  'ad.success': 'বিজ্ঞাপন সফলভাবে দেখা হয়েছে!',
  'ad.canClaim': 'আপনি এখন প্রগ্রেস নিতে পারবেন',
  'ad.watchFor': 'বিজ্ঞাপন দেখুন',
  'ad.seconds': 'সেকেন্ড প্রগ্রেস পেতে',
  
  // Empty states
  'empty.noUnlockables': 'এখনো কোন কন্টেন্ট নেই',
  'empty.noFavorites': 'এখনো পছন্দ করা হয়নি। যেকোনো কন্টেন্টে হার্ট আইকনে ট্যাপ করে এখানে যোগ করুন।',
  'empty.noUnlocked': 'এখনো কিছু আনলক হয়নি। বিজ্ঞাপন দেখে কন্টেন্ট আনলক করুন!',
  'empty.notFound': 'কন্টেন্ট পাওয়া যায়নি',
  'empty.locked': 'এই কন্টেন্ট লক করা',
  'empty.noItems': 'কোন আইটেম পাওয়া যায়নি',
  
  // Content
  'content.photo': 'ছবি',
  'content.photos': 'টি ছবি',
  'content.link': 'লিংক',
  'content.imageNotAvailable': 'ছবি পাওয়া যাচ্ছে না',
  'content.containsLink': 'এই কন্টেন্টে একটি লিংক আছে',
  'content.of': 'এর',
  
  // Maintenance
  'maintenance.title': 'মেইন্টেন্যান্সে আছে',
  'maintenance.message': 'অ্যাপ মেইন্টেন্যান্সে আছে। পরে আবার চেক করুন।',
  'maintenance.checkLater': 'পরে আবার চেক করুন।',
  'maintenance.adminNotice': 'অ্যাপ মেইন্টেন্যান্স মোডে আছে। সাধারণ ব্যবহারকারীরা অ্যাক্সেস করতে পারবে না।',
  'maintenance.showOverlay': 'ওভারলে দেখান',
  
  // Errors
  'error.loading': 'কন্টেন্ট লোড করতে সমস্যা হয়েছে',
  'error.profile': 'প্রোফাইল লোড করতে সমস্যা হয়েছে',
  
  // Settings
  'settings.language': 'ভাষা',
  'settings.languageAuto': 'অটো (স্বয়ংক্রিয়)',
  'settings.languageHint': 'আপনার পছন্দের ভাষা বেছে নিন বা অটো-ডিটেকশন ব্যবহার করুন',
};
