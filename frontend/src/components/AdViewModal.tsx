import { useState, useEffect, useRef, useCallback } from 'react';
import type { Unlockable, PrimaryAdType } from '@/types';
import { useApp } from '@/context/AppContext';
import { XMarkIcon, CheckIcon, TvIcon, ExclamationTriangleIcon, CheckCircleIcon } from './Icons';
import {
  showRewardedInterstitial,
  showRewardedPopup,
  generateYmid,
} from '@/services/monetag';

interface AdViewModalProps {
  unlockable: Unlockable | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type AdState = 'idle' | 'loading' | 'watching' | 'completed' | 'error';

export default function AdViewModal({ unlockable, isOpen, onClose, onComplete }: AdViewModalProps) {
  const { settings } = useApp();
  const threshold = settings?.adWatchThreshold || 5;
  const gracePeriod = settings?.adDetectionGracePeriod || 10;
  const hideTimerUI = settings?.hideTimerUI || false;

  // Primary ad configuration
  const primaryAdType: PrimaryAdType = settings?.primaryAdType || 'direct_link';
  const directLinkUrl = settings?.directLinkUrl || settings?.adsterraUrl;

  // Monetag config
  const monetagYmid = settings?.monetagYmid;
  const monetagRequestVar = settings?.monetagRequestVar || 'unlock_ad';
  const monetagPreloadEnabled = settings?.monetagPreloadEnabled ?? true;
  const monetagTimeout = settings?.monetagTimeout || 5;

  // State
  const [adState, setAdState] = useState<AdState>('idle');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [adWindow, setAdWindow] = useState<Window | null>(null);
  const [showFallbackClaim, setShowFallbackClaim] = useState(false);
  const [windowClosedEarly, setWindowClosedEarly] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const adOpenTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkClosedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ymidRef = useRef<string>('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeElapsed(0);
      setAdState('idle');
      setAdWindow(null);
      setShowFallbackClaim(false);
      setWindowClosedEarly(false);
      setErrorMessage(null);
      adOpenTimeRef.current = null;
      ymidRef.current = '';
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (checkClosedRef.current) {
        clearInterval(checkClosedRef.current);
        checkClosedRef.current = null;
      }
    } else {
      // Generate ymid for this ad session
      ymidRef.current = monetagYmid || generateYmid('ad');
    }
  }, [isOpen, monetagYmid]);

  // Timer and window close detection for direct_link type
  useEffect(() => {
    if (primaryAdType !== 'direct_link' || !adWindow) return;

    adOpenTimeRef.current = Date.now();
    setAdState('watching');
    setWindowClosedEarly(false);

    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    checkClosedRef.current = setInterval(() => {
      try {
        const isClosed = adWindow.closed;

        if (isClosed) {
          const openDuration = adOpenTimeRef.current
            ? Math.floor((Date.now() - adOpenTimeRef.current) / 1000)
            : 0;

          if (openDuration >= threshold) {
            setAdState('completed');
          } else {
            setWindowClosedEarly(true);
            setAdState('idle');
            setAdWindow(null);
            setTimeElapsed(0);
          }

          if (checkClosedRef.current) {
            clearInterval(checkClosedRef.current);
            checkClosedRef.current = null;
          }
        }
      } catch {
        // Cross-origin restriction
      }
    }, 500);

    return () => {
      if (checkClosedRef.current) {
        clearInterval(checkClosedRef.current);
        checkClosedRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [adWindow, threshold, primaryAdType]);

  // Show fallback claim option after threshold + grace period (for direct_link)
  useEffect(() => {
    if (primaryAdType === 'direct_link' && adState === 'watching' && timeElapsed >= threshold + gracePeriod) {
      setShowFallbackClaim(true);
    }
  }, [timeElapsed, adState, threshold, gracePeriod, primaryAdType]);

  // Handle ad based on type
  const handleAdClick = useCallback(async () => {
    setErrorMessage(null);

    if (primaryAdType === 'direct_link') {
      // Direct link: open in new window
      if (directLinkUrl) {
        const win = window.open(directLinkUrl, '_blank');
        if (win) {
          setAdWindow(win);
        } else {
          setErrorMessage('Unable to open ad window. Please check popup blocker.');
          setAdState('error');
        }
      } else {
        setErrorMessage('No ad URL configured.');
        setAdState('error');
      }
    } else if (primaryAdType === 'monetag_rewarded_interstitial') {
      // Monetag Rewarded Interstitial
      setAdState('loading');

      const result = await showRewardedInterstitial({
        ymid: ymidRef.current,
        requestVar: monetagRequestVar,
        preload: monetagPreloadEnabled,
        timeout: monetagTimeout,
        catchIfNoFeed: true,
      });

      if (result.success) {
        setAdState('completed');
      } else {
        setErrorMessage('Ad not available. Please try again.');
        setAdState('error');
      }
    } else if (primaryAdType === 'monetag_rewarded_popup') {
      // Monetag Rewarded Popup
      setAdState('loading');

      const result = await showRewardedPopup({
        ymid: ymidRef.current,
        requestVar: monetagRequestVar,
      });

      if (result.success) {
        // Popup resolves immediately - consider it completed
        setAdState('completed');
      } else {
        setErrorMessage('Unable to open popup. Please check popup blocker.');
        setAdState('error');
      }
    }
  }, [primaryAdType, directLinkUrl, monetagRequestVar, monetagPreloadEnabled, monetagTimeout]);

  const handleComplete = () => {
    if (adState === 'completed') {
      onComplete();
      onClose();
    }
  };

  const handleFallbackClaim = () => {
    setAdState('completed');
    setShowFallbackClaim(false);
  };

  const handleRetry = () => {
    setAdState('idle');
    setWindowClosedEarly(false);
    setErrorMessage(null);
    setTimeElapsed(0);
  };

  const timeLeft = Math.max(0, threshold - timeElapsed);
  const progressValue = Math.min(timeElapsed, threshold);

  // Determine if ad was watched (completed state)
  const adWatched = adState === 'completed';
  const isLoading = adState === 'loading';
  const isWatching = adState === 'watching';
  const hasError = adState === 'error';

  if (!isOpen || !unlockable) return null;

  // Render ad button based on state
  const renderAdButton = () => {
    if (adWatched) {
      return (
        <div className="badge badge-success gap-1">
          <CheckIcon className="w-4 h-4" />
          Ad Viewed
        </div>
      );
    }

    if (hasError) {
      return (
        <button onClick={handleRetry} className="btn btn-primary">
          Try Again
        </button>
      );
    }

    if (windowClosedEarly && !hideTimerUI && primaryAdType === 'direct_link') {
      return (
        <button onClick={handleAdClick} className="btn btn-primary">
          Try Again
        </button>
      );
    }

    if (isLoading) {
      return (
        <div className="badge badge-primary gap-1">
          <span className="loading loading-spinner loading-xs"></span>
          Loading ad...
        </div>
      );
    }

    if (isWatching) {
      if (hideTimerUI || primaryAdType !== 'direct_link') {
        return (
          <div className="badge badge-primary gap-1">
            <span className="loading loading-spinner loading-xs"></span>
            Please wait...
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="badge badge-primary gap-1">
            <span className="loading loading-spinner loading-xs"></span>
            {timeLeft}s remaining
          </div>
          <progress className="progress progress-primary w-32" value={progressValue} max={threshold}></progress>
        </div>
      );
    }

    return (
      <button onClick={handleAdClick} className="btn btn-primary">
        View Ad
      </button>
    );
  };

  // Get status message based on state and type
  const getStatusMessage = () => {
    if (adWatched) {
      return 'Ad viewed successfully!';
    }
    if (hasError) {
      return errorMessage || 'Something went wrong. Please try again.';
    }
    if (hideTimerUI) {
      if (isLoading || isWatching) return 'Please wait...';
      return 'Click below to view the ad';
    }
    if (windowClosedEarly && primaryAdType === 'direct_link') {
      return 'Ad window closed too early. Try again!';
    }
    if (isWatching) {
      if (primaryAdType === 'direct_link') {
        return `Keep the ad window open for ${timeLeft} more seconds...`;
      }
      return 'Please wait while the ad plays...';
    }
    if (isLoading) {
      return 'Loading ad...';
    }
    return 'Click below to view the ad';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={adWatched ? onClose : undefined} />

      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h3 className="font-bold text-lg">Watch Ad to Unlock</h3>
          <button onClick={onClose} className="btn btn-circle btn-sm btn-ghost">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <p className="text-sm text-base-content/70 mb-3">
            Watch this ad to get closer to unlocking: <strong>{unlockable.title}</strong>
          </p>

          {/* Ad button area */}
          <div className="relative bg-base-200 rounded-lg overflow-hidden min-h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <div className="text-4xl mb-4 text-primary"><TvIcon className="w-10 h-10" /></div>
              <p className="font-semibold mb-2">Sponsored Content</p>
              <p className="text-sm text-base-content/60 mb-4">
                {getStatusMessage()}
              </p>
              {renderAdButton()}
            </div>
          </div>

          {/* Fallback claim option - only for direct_link type */}
          {primaryAdType === 'direct_link' && showFallbackClaim && !adWatched && (
            <div className="mt-4 p-3 bg-base-200 rounded-lg border border-base-300">
              <p className="text-sm text-center text-base-content/70 mb-2">
                Closed the ad window?
              </p>
              <button
                onClick={handleFallbackClaim}
                className="btn btn-outline btn-success btn-sm w-full"
              >
                Claim My Progress
              </button>
            </div>
          )}

          {/* Timer info */}
          <div className="mt-4 text-center">
            {adWatched ? (
              <p className="text-sm text-success flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4" /> You can now claim your progress
              </p>
            ) : hideTimerUI ? (
              <p className="text-sm text-base-content/60">
                {isWatching || isLoading ? 'Please wait while the ad loads...' : 'View the ad to earn progress'}
              </p>
            ) : windowClosedEarly && primaryAdType === 'direct_link' ? (
              <p className="text-sm text-warning flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" /> Ad was closed too early. Please watch for the full duration.
              </p>
            ) : isWatching && primaryAdType === 'direct_link' ? (
              <p className="text-sm text-base-content/60">
                Do not close the ad window until the timer completes
              </p>
            ) : (
              <p className="text-sm text-base-content/60">
                {primaryAdType === 'direct_link'
                  ? <>Watch the ad for <span className="font-bold text-primary">{threshold} seconds</span> to earn progress</>
                  : 'Watch the ad to earn progress'
                }
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-base-300">
          <button
            onClick={handleComplete}
            disabled={!adWatched}
            className={`btn w-full ${adWatched ? 'btn-success' : 'btn-disabled'}`}
          >
            {adWatched ? 'Claim Progress' : 'Watch Ad to Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
