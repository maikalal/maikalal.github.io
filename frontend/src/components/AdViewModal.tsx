import { useState, useEffect, useRef } from 'react';
import type { Unlockable } from '@/types';
import { useApp } from '@/context/AppContext';
import { XMarkIcon, CheckIcon, TvIcon, ExclamationTriangleIcon, CheckCircleIcon } from './Icons';

interface AdViewModalProps {
  unlockable: Unlockable | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

// Adsterra smartlink URL from environment variable (fallback)
const ENV_ADSTERRA_URL = import.meta.env.VITE_ADSTERRA_URL || '';

export default function AdViewModal({ unlockable, isOpen, onClose, onComplete }: AdViewModalProps) {
  const { settings } = useApp();
  const threshold = settings?.adWatchThreshold || 5;
  const gracePeriod = settings?.adDetectionGracePeriod || 10;
  const hideTimerUI = settings?.hideTimerUI || false;
  // Use settings URL if available, otherwise fall back to env var
  const adsterraUrl = settings?.adsterraUrl || ENV_ADSTERRA_URL;

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [adWatched, setAdWatched] = useState(false);
  const [adWindow, setAdWindow] = useState<Window | null>(null);
  const [isWatching, setIsWatching] = useState(false);
  const [showFallbackClaim, setShowFallbackClaim] = useState(false);
  const [windowClosedEarly, setWindowClosedEarly] = useState(false);

  const adOpenTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const checkClosedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeElapsed(0);
      setAdWatched(false);
      setAdWindow(null);
      setIsWatching(false);
      setShowFallbackClaim(false);
      setWindowClosedEarly(false);
      adOpenTimeRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (checkClosedRef.current) {
        clearInterval(checkClosedRef.current);
        checkClosedRef.current = null;
      }
    }
  }, [isOpen]);

  // Main timer and window close detection logic
  useEffect(() => {
    if (!adWindow) return;

    // Record when ad window was opened
    adOpenTimeRef.current = Date.now();
    setIsWatching(true);
    setWindowClosedEarly(false);

    // Start elapsed time timer
    timerRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Check if ad window is closed
    checkClosedRef.current = setInterval(() => {
      try {
        // Try to access .closed property - may throw for cross-origin
        const isClosed = adWindow.closed;

        if (isClosed) {
          const openDuration = adOpenTimeRef.current
            ? Math.floor((Date.now() - adOpenTimeRef.current) / 1000)
            : 0;

          // Only count as watched if open for threshold seconds
          if (openDuration >= threshold) {
            setAdWatched(true);
            setIsWatching(false);
          } else {
            // Ad closed too early
            setWindowClosedEarly(true);
            setIsWatching(false);
            setAdWindow(null);
            setTimeElapsed(0);
          }

          if (checkClosedRef.current) {
            clearInterval(checkClosedRef.current);
            checkClosedRef.current = null;
          }
        }
      } catch {
        // Cross-origin restriction - can't detect window close
        // Timer continues, fallback will appear after threshold + grace period
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
  }, [adWindow, threshold]);

  // Show fallback claim option after threshold + grace period
  useEffect(() => {
    if (isWatching && timeElapsed >= threshold + gracePeriod && !adWatched) {
      setShowFallbackClaim(true);
    }
  }, [timeElapsed, isWatching, threshold, gracePeriod, adWatched]);

  const handleAdClick = () => {
    if (adsterraUrl) {
      // Open Adsterra smartlink in new window
      // Note: Not using noopener to allow .closed detection (may still fail for cross-origin)
      const win = window.open(adsterraUrl, '_blank');
      if (win) {
        setAdWindow(win);
      }
    }
  };

  const handleComplete = () => {
    if (adWatched) {
      onComplete();
      onClose();
    }
  };

  const handleFallbackClaim = () => {
    setAdWatched(true);
    setIsWatching(false);
    setShowFallbackClaim(false);
  };

  const timeLeft = Math.max(0, threshold - timeElapsed);
  const progressValue = Math.min(timeElapsed, threshold);

  if (!isOpen || !unlockable) return null;

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
                {adWatched
                  ? 'Ad viewed successfully!'
                  : hideTimerUI
                    ? isWatching
                      ? 'Please wait...'
                      : 'Click below to view the ad'
                    : windowClosedEarly
                      ? 'Ad window closed too early. Try again!'
                      : isWatching
                        ? `Keep the ad window open for ${timeLeft} more seconds...`
                        : 'Click below to view the ad'
                }
              </p>
              {adWatched ? (
                <div className="badge badge-success gap-1">
                  <CheckIcon className="w-4 h-4" />
                  Ad Viewed
                </div>
              ) : windowClosedEarly && !hideTimerUI ? (
                <button
                  onClick={handleAdClick}
                  className="btn btn-primary"
                >
                  Try Again
                </button>
              ) : isWatching ? (
                hideTimerUI ? (
                  <div className="badge badge-primary gap-1">
                    <span className="loading loading-spinner loading-xs"></span>
                    Please wait...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="badge badge-primary gap-1">
                      <span className="loading loading-spinner loading-xs"></span>
                      {timeLeft}s remaining
                    </div>
                    <progress className="progress progress-primary w-32" value={progressValue} max={threshold}></progress>
                  </div>
                )
              ) : (
                <button
                  onClick={handleAdClick}
                  className="btn btn-primary"
                >
                  View Ad
                </button>
              )}
            </div>
          </div>

          {/* Fallback claim option */}
          {showFallbackClaim && !adWatched && (
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
                {isWatching ? 'Please wait while the ad loads...' : 'View the ad to earn progress'}
              </p>
            ) : windowClosedEarly ? (
              <p className="text-sm text-warning flex items-center gap-1">
                <ExclamationTriangleIcon className="w-4 h-4" /> Ad was closed too early. Please watch for the full duration.
              </p>
            ) : isWatching ? (
              <p className="text-sm text-base-content/60">
                Do not close the ad window until the timer completes
              </p>
            ) : (
              <p className="text-sm text-base-content/60">
                Watch the ad for <span className="font-bold text-primary">{threshold} seconds</span> to earn progress
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
