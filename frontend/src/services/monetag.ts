import createAdHandler from 'monetag-tg-sdk';
import type { MonetagInAppSettings } from '@/types';

// SDK handler instance
let adHandler: ReturnType<typeof createAdHandler> | null = null;
let currentZoneId: number | null = null;
let isPreloaded = false;
let inAppInitialized = false;

/**
 * Initialize the Monetag SDK with a zone ID
 * Must be called before any ad operations
 */
export function initMonetag(zoneId: string | number): boolean {
  const zoneIdNum = typeof zoneId === 'string' ? parseInt(zoneId, 10) : zoneId;
  
  if (!zoneIdNum || isNaN(zoneIdNum)) {
    console.warn('[Monetag] No valid zone ID provided');
    return false;
  }

  // Skip if already initialized with same zone
  if (adHandler && currentZoneId === zoneIdNum) {
    return true;
  }

  try {
    adHandler = createAdHandler(zoneIdNum);
    currentZoneId = zoneIdNum;
    isPreloaded = false;
    console.log('[Monetag] SDK initialized with zone:', zoneId);
    return true;
  } catch (error) {
    console.error('[Monetag] Failed to initialize SDK:', error);
    return false;
  }
}

/**
 * Get the current ad handler
 */
export function getAdHandler() {
  return adHandler;
}

/**
 * Check if SDK is initialized
 */
export function isMonetagInitialized(): boolean {
  return adHandler !== null;
}

/**
 * Check if an ad is preloaded
 */
export function isAdPreloaded(): boolean {
  return isPreloaded;
}

/**
 * Preload a Rewarded Interstitial ad
 * Call this before showing the ad for faster display
 */
export async function preloadAd(options: {
  ymid?: string;
  requestVar?: string;
  timeout?: number;
}): Promise<boolean> {
  if (!adHandler) {
    console.warn('[Monetag] SDK not initialized');
    return false;
  }

  try {
    await adHandler({
      type: 'preload',
      ymid: options.ymid,
      requestVar: options.requestVar,
      timeout: options.timeout || 5,
    });
    isPreloaded = true;
    console.log('[Monetag] Ad preloaded successfully');
    return true;
  } catch (error) {
    console.warn('[Monetag] Preload failed:', error);
    isPreloaded = false;
    return false;
  }
}

/**
 * Show a Rewarded Interstitial ad
 * Returns true if the ad was shown and valued (monetized)
 */
export async function showRewardedInterstitial(options: {
  ymid?: string;
  requestVar?: string;
  preload?: boolean;
  timeout?: number;
  catchIfNoFeed?: boolean;
}): Promise<{ success: boolean; valued?: boolean; estimatedPrice?: number }> {
  if (!adHandler) {
    console.warn('[Monetag] SDK not initialized');
    return { success: false };
  }

  try {
    // Preload first if requested and not already preloaded
    if (options.preload && !isPreloaded) {
      await preloadAd({
        ymid: options.ymid,
        requestVar: options.requestVar,
        timeout: options.timeout,
      });
    }

    // If preloaded, just call without type (SDK knows it's preloaded)
    // Otherwise use 'end' for rewarded interstitial
    const result = await adHandler({
      type: 'end',
      ymid: options.ymid,
      requestVar: options.requestVar,
      catchIfNoFeed: options.catchIfNoFeed ?? true,
    }) as { reward_event_type?: string; estimated_price?: number } | undefined;

    isPreloaded = false; // Reset preload state after showing

    const valued = result?.reward_event_type === 'valued';
    console.log('[Monetag] Rewarded Interstitial completed:', { valued, estimatedPrice: result?.estimated_price });

    return {
      success: true,
      valued,
      estimatedPrice: result?.estimated_price,
    };
  } catch (error) {
    console.warn('[Monetag] Rewarded Interstitial failed:', error);
    isPreloaded = false;
    return { success: false };
  }
}

/**
 * Show a Rewarded Popup ad
 * Opens advertiser page in new context
 * Promise resolves immediately after trigger (not after viewing)
 */
export async function showRewardedPopup(options: {
  ymid?: string;
  requestVar?: string;
}): Promise<{ success: boolean }> {
  if (!adHandler) {
    console.warn('[Monetag] SDK not initialized');
    return { success: false };
  }

  try {
    await adHandler({
      type: 'pop',
      ymid: options.ymid,
      requestVar: options.requestVar,
    });

    console.log('[Monetag] Rewarded Popup triggered');
    return { success: true };
  } catch (error) {
    console.warn('[Monetag] Rewarded Popup failed:', error);
    return { success: false };
  }
}

/**
 * Initialize In-App Interstitial (background ads)
 * These ads show automatically based on configured settings
 */
export function initInAppInterstitial(settings: MonetagInAppSettings): boolean {
  if (!adHandler) {
    console.warn('[Monetag] SDK not initialized');
    return false;
  }

  if (!settings.enabled) {
    console.log('[Monetag] In-App Interstitial disabled');
    return false;
  }

  if (inAppInitialized) {
    console.log('[Monetag] In-App Interstitial already initialized');
    return true;
  }

  try {
    adHandler({
      type: 'inApp',
      inAppSettings: {
        frequency: settings.frequency,
        capping: settings.capping,
        interval: settings.interval,
        timeout: settings.timeout,
        everyPage: settings.everyPage,
      },
    });

    inAppInitialized = true;
    console.log('[Monetag] In-App Interstitial initialized:', settings);
    return true;
  } catch (error) {
    console.error('[Monetag] Failed to initialize In-App Interstitial:', error);
    return false;
  }
}

/**
 * Reset In-App Interstitial state
 * Call this when settings change
 */
export function resetInAppInterstitial(): void {
  inAppInitialized = false;
}

/**
 * Reset all Monetag state
 * Call this when zone ID changes
 */
export function resetMonetag(): void {
  adHandler = null;
  currentZoneId = null;
  isPreloaded = false;
  inAppInitialized = false;
}

/**
 * Generate a unique ymid for tracking
 */
export function generateYmid(prefix: string = 'user'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
