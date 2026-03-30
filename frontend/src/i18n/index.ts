import { useState, useEffect } from 'react';
import { useSignal } from '@tma.js/sdk-react';
import { initData } from '@tma.js/sdk';
import { useApp } from '@/context/AppContext';
import type { TranslationKey } from './types';
import type { SupportedLanguage } from '@/types';
import { LANGUAGE_MAPPING, DEFAULT_LANGUAGE_SETTINGS } from './constants';
import { detectLanguageFromIP } from '@/services/geolocation';
import { en } from './translations/en';
import { bn } from './translations/bn';

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en,
  bn,
};

/**
 * Detects and returns the current language based on settings and Telegram user data
 * Priority: user preferredLanguage → forceLanguage → IP geolocation → Telegram language_code → fallback
 */
export function useLanguage(): SupportedLanguage {
  const { settings, user } = useApp();
  const telegramUser = useSignal(initData.state)?.user;
  const [ipLanguage, setIpLanguage] = useState<SupportedLanguage | null>(null);
  const [ipDetectionAttempted, setIpDetectionAttempted] = useState(false);
  
  const config = settings?.languageSettings;
  
  // Run IP detection when settings are loaded and IP detection is enabled
  useEffect(() => {
    const shouldDetect = config?.enableIpDetection && !ipDetectionAttempted;
    
    if (shouldDetect) {
      console.log('[useLanguage] Starting IP detection, enableIpDetection:', config?.enableIpDetection);
      setIpDetectionAttempted(true);
      
      detectLanguageFromIP()
        .then(lang => {
          if (lang) {
            console.log('[useLanguage] IP detection result:', lang);
            setIpLanguage(lang);
          } else {
            console.log('[useLanguage] IP detection returned null (country not mapped or API error)');
          }
        })
        .catch(err => {
          console.warn('[useLanguage] IP detection failed:', err);
        });
    }
  }, [config?.enableIpDetection, ipDetectionAttempted]);
  
  // 1. User's preferred language (highest priority - user choice)
  if (user?.preferredLanguage) {
    console.log('[useLanguage] Using user preferredLanguage:', user.preferredLanguage);
    return user.preferredLanguage;
  }
  
  // 2. Force language (admin override)
  if (config?.forceLanguage) {
    console.log('[useLanguage] Using forceLanguage:', config.forceLanguage);
    return config.forceLanguage;
  }
  
  // 3. If auto-detect disabled, use default language
  if (!config?.autoDetectLanguage) {
    const lang = config?.defaultLanguage || DEFAULT_LANGUAGE_SETTINGS.defaultLanguage;
    console.log('[useLanguage] Auto-detect disabled, using defaultLanguage:', lang);
    return lang;
  }
  
  // 4. IP geolocation (if enabled and detected)
  if (config?.enableIpDetection && ipLanguage) {
    const supported = config.supportedLanguages || DEFAULT_LANGUAGE_SETTINGS.supportedLanguages;
    if ((supported as SupportedLanguage[]).includes(ipLanguage)) {
      console.log('[useLanguage] Using IP-detected language:', ipLanguage);
      return ipLanguage;
    } else {
      console.log('[useLanguage] IP language not in supported list, falling through');
    }
  }
  
  // 5. Telegram language_code
  const telegramCode = telegramUser?.language_code;
  const detected = telegramCode 
    ? (LANGUAGE_MAPPING[telegramCode] || LANGUAGE_MAPPING.default || config?.defaultLanguage || 'en')
    : (LANGUAGE_MAPPING.default || config?.defaultLanguage || 'en');
  
  // 6. Verify detected language is supported
  const supported = config?.supportedLanguages || DEFAULT_LANGUAGE_SETTINGS.supportedLanguages;
  
  const finalLang = (supported as SupportedLanguage[]).includes(detected as SupportedLanguage) 
    ? (detected as SupportedLanguage) 
    : (config?.defaultLanguage || DEFAULT_LANGUAGE_SETTINGS.defaultLanguage);
  
  console.log('[useLanguage] Final decision - telegramCode:', telegramCode, 'detected:', detected, 'final:', finalLang);
  
  return finalLang;
}

/**
 * Translation hook - returns t() function and current language
 */
export function useTranslation() {
  const lang = useLanguage();
  
  const t = (key: TranslationKey): string => {
    return translations[lang][key] || key;
  };
  
  return { t, lang };
}
