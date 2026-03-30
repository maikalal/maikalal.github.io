import type { SupportedLanguage } from '@/types';

/**
 * Map country codes to supported languages
 * Developer-managed: update when adding new languages
 */
const COUNTRY_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  // Bangladesh → Bangla
  BD: 'bn',
  
  // English-speaking countries
  US: 'en',  // United States
  GB: 'en',  // United Kingdom
  AU: 'en',  // Australia
  CA: 'en',  // Canada
  NZ: 'en',  // New Zealand
  IE: 'en',  // Ireland
  ZA: 'en',  // South Africa
  SG: 'en',  // Singapore
  PH: 'en',  // Philippines (English widely used)
  
  // India - mixed, default to English (Hindi/Bengali speakers can use language_code)
  IN: 'en',
  
  // Pakistan - English widely used alongside Urdu
  PK: 'en',
  
  // Other countries with significant English usage
  AE: 'en',  // UAE
  SA: 'en',  // Saudi Arabia
  MY: 'en',  // Malaysia
  NG: 'en',  // Nigeria
  KE: 'en',  // Kenya
};

const SESSION_CACHE_KEY = 'ip_detection';

interface SessionCache {
  language: SupportedLanguage | null;
  country: string | null;
}

/**
 * Get cached detection from session storage
 * Session storage is cleared when tab/browser closes
 */
function getSessionCache(): SessionCache | null {
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

/**
 * Save detection to session storage
 */
function setSessionCache(language: SupportedLanguage | null, country: string | null): void {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ language, country }));
  } catch {
    // Ignore storage errors
  }
}

interface GeoJSResponse {
  ip?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

/**
 * Detect user's language from IP geolocation
 * Uses GeoJS API - free, HTTPS, CORS-enabled, no API key required
 * 
 * Caching: One call per browser session (stored in sessionStorage)
 * - Opening app triggers new call
 * - Refreshing page uses cache
 * - Closing tab and reopening triggers new call
 * 
 * @returns Detected language or null if detection failed
 */
export async function detectLanguageFromIP(): Promise<SupportedLanguage | null> {
  // Check session cache first
  const cached = getSessionCache();
  if (cached) {
    console.log('[Geolocation] Using session cache:', cached);
    return cached.language;
  }
  
  try {
    // Using GeoJS - free, HTTPS, CORS-enabled, no API key needed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn('[Geolocation] API request failed:', response.status);
      return null;
    }
    
    const data: GeoJSResponse = await response.json();
    
    const countryCode = data.country_code;
    
    if (!countryCode) {
      console.warn('[Geolocation] No country code in response');
      return null;
    }
    
    // Map country to language
    const detected = COUNTRY_TO_LANGUAGE[countryCode] || null;
    
    // Save to session cache
    setSessionCache(detected, countryCode);
    
    console.log('[Geolocation] Detected country:', countryCode, '→ language:', detected);
    
    return detected;
  } catch (error) {
    // Don't log abort errors (timeout)
    if (error instanceof Error && error.name !== 'AbortError') {
      console.warn('[Geolocation] Detection failed:', error);
    }
    return null;
  }
}

/**
 * Clear the geolocation session cache (useful for testing)
 */
export function clearGeolocationCache(): void {
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Ignore storage errors
  }
}
