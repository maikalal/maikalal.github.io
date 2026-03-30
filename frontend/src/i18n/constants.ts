import type { LanguageSettings } from '@/types';

// Language mapping from Telegram language codes to app languages
// This is developer-managed - admins cannot change this
export const LANGUAGE_MAPPING: Record<string, string> = {
  bn: 'bn',    // Bengali → Bangla
  en: 'en',    // English → English
  hi: 'en',    // Hindi → English (no Hindi translation yet)
  ur: 'en',    // Urdu → English
  ru: 'en',    // Russian → English
  uk: 'en',    // Ukrainian → English
  default: 'en',
};

export const DEFAULT_LANGUAGE_SETTINGS: LanguageSettings = {
  defaultLanguage: 'en',
  autoDetectLanguage: true,
  supportedLanguages: ['en', 'bn'],
  forceLanguage: null,        // No force by default
  enableIpDetection: true,    // IP detection enabled by default
};
