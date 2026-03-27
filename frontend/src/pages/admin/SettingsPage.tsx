import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getSettings, updateSettings } from '@/firebase/firestore';
import type { AppSettings } from '@/types';
import { EyeIcon, EyeSlashIcon } from '@/components/Icons';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adWatchThreshold, setAdWatchThreshold] = useState('5');
  const [adsterraUrl, setAdsterraUrl] = useState('');
  const [adDetectionGracePeriod, setAdDetectionGracePeriod] = useState('10');
  const [hideTimerUI, setHideTimerUI] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings(data);
      setAdWatchThreshold(String(data.adWatchThreshold));
      setAdsterraUrl(data.adsterraUrl || '');
      setAdDetectionGracePeriod(String(data.adDetectionGracePeriod || 10));
      setHideTimerUI(data.hideTimerUI || false);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const threshold = Math.max(1, Math.min(60, parseInt(adWatchThreshold) || 5));
    const gracePeriod = Math.max(1, Math.min(60, parseInt(adDetectionGracePeriod) || 10));

    setSaving(true);
    try {
      await updateSettings({
        adWatchThreshold: threshold,
        adsterraUrl: adsterraUrl || undefined,
        adDetectionGracePeriod: gracePeriod,
        hideTimerUI,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <div className="card bg-base-200 shadow-sm max-w-lg">
          <div className="card-body">
            <h2 className="card-title">Ad Settings</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Ad Watch Threshold (seconds)</span>
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={adWatchThreshold}
                onChange={(e) => setAdWatchThreshold(e.target.value)}
                onBlur={() => {
                  const val = parseInt(adWatchThreshold);
                  if (!val || val < 1) setAdWatchThreshold('1');
                  else if (val > 60) setAdWatchThreshold('60');
                }}
                className="input input-bordered"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Minimum time user must watch ad before it counts (1-60)
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Adsterra URL</span>
              </label>
              <input
                type="url"
                value={adsterraUrl}
                onChange={(e) => setAdsterraUrl(e.target.value)}
                placeholder="https://example.com/ad-link"
                className="input input-bordered"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Adsterra smartlink URL for ad viewing
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Ad Detection Grace Period (seconds)</span>
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={adDetectionGracePeriod}
                onChange={(e) => setAdDetectionGracePeriod(e.target.value)}
                onBlur={() => {
                  const val = parseInt(adDetectionGracePeriod);
                  if (!val || val < 1) setAdDetectionGracePeriod('1');
                  else if (val > 60) setAdDetectionGracePeriod('60');
                }}
                className="input input-bordered"
              />
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Time to wait before showing fallback claim option if window close detection fails (1-60)
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text flex items-center gap-2">
                  {hideTimerUI ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  Hide Timer UI from Users
                </span>
                <input
                  type="checkbox"
                  checked={hideTimerUI}
                  onChange={(e) => setHideTimerUI(e.target.checked)}
                  className="toggle toggle-primary"
                />
              </label>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  Hide all timer-related UI (countdown, progress bar, time messages) to obscure the timer-based system
                </span>
              </label>
            </div>

            <div className="card-actions justify-end mt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
          <div className="card-body">
            <h2 className="card-title text-sm">About Settings</h2>
            <ul className="text-sm text-base-content/70 space-y-2">
              <li>
                <strong>Ad Watch Threshold:</strong> Users must keep the ad window open for at least this many seconds for the ad to count.
              </li>
              <li>
                <strong>Adsterra URL:</strong> The smartlink URL that opens when users watch ads. Leave empty to use environment variable.
              </li>
              <li>
                <strong>Ad Detection Grace Period:</strong> If window close detection fails, this is the time waited before showing a manual claim option.
              </li>
              <li>
                <strong>Hide Timer UI:</strong> When enabled, hides all timer-related UI elements from users, making the ad reward system appear non-timer-based.
              </li>
            </ul>
          </div>
        </div>

        {/* Last Updated */}
        {settings?.updatedAt && (
          <p className="text-xs text-base-content/40 mt-4">
            Last updated: {settings.updatedAt.toLocaleString()}
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
