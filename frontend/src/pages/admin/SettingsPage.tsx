import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getSettings, updateSettings } from '@/firebase/firestore';
import type { AppSettings, PrimaryAdType, MonetagInAppSettings, LanguageSettings, SupportedLanguage } from '@/types';
import { EyeIcon, EyeSlashIcon } from '@/components/Icons';
import { DEFAULT_LANGUAGE_SETTINGS } from '@/i18n/constants';

const AD_TYPE_OPTIONS: { value: PrimaryAdType; label: string; description: string }[] = [
  { value: 'direct_link', label: 'Direct Link URL', description: 'Opens a URL in new window (works with Adsterra, Monetag direct links, or any ad network)' },
  { value: 'monetag_rewarded_interstitial', label: 'Monetag Rewarded Interstitial', description: 'Full-screen SDK ad that resolves when completed' },
  { value: 'monetag_rewarded_popup', label: 'Monetag Rewarded Popup', description: 'Opens advertiser page in new context (popup)' },
];

const DEFAULT_INAPP_SETTINGS: MonetagInAppSettings = {
  enabled: false,
  frequency: 3,
  capping: 0.5,
  interval: 60,
  timeout: 10,
  everyPage: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // General settings
  const [adWatchThreshold, setAdWatchThreshold] = useState('5');
  const [adDetectionGracePeriod, setAdDetectionGracePeriod] = useState('10');
  const [hideTimerUI, setHideTimerUI] = useState(false);

  // Primary ad configuration
  const [primaryAdType, setPrimaryAdType] = useState<PrimaryAdType>('direct_link');
  const [directLinkUrl, setDirectLinkUrl] = useState('');

  // Monetag SDK config
  const [monetagZoneId, setMonetagZoneId] = useState('');
  const [monetagYmid, setMonetagYmid] = useState('');
  const [monetagRequestVar, setMonetagRequestVar] = useState('');
  const [monetagPreloadEnabled, setMonetagPreloadEnabled] = useState(true);
  const [monetagTimeout, setMonetagTimeout] = useState('5');

  // In-App Interstitial
  const [inAppEnabled, setInAppEnabled] = useState(false);
  const [inAppFrequency, setInAppFrequency] = useState('3');
  const [inAppCapping, setInAppCapping] = useState('0.5');
  const [inAppInterval, setInAppInterval] = useState('60');
  const [inAppTimeout, setInAppTimeout] = useState('10');
  const [inAppEveryPage, setInAppEveryPage] = useState(false);

  // Maintenance Mode
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceAllowAdmins, setMaintenanceAllowAdmins] = useState(true);

  // Language Settings
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState<SupportedLanguage>('en');
  const [forceLanguage, setForceLanguage] = useState<SupportedLanguage | null>(null);
  const [enableIpDetection, setEnableIpDetection] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings(data);
      setAdWatchThreshold(String(data.adWatchThreshold));
      setAdDetectionGracePeriod(String(data.adDetectionGracePeriod || 10));
      setHideTimerUI(data.hideTimerUI || false);

      // Primary ad config - migrate from legacy adsterraUrl
      setPrimaryAdType(data.primaryAdType || 'direct_link');
      setDirectLinkUrl(data.directLinkUrl || data.adsterraUrl || '');

      // Monetag SDK config
      setMonetagZoneId(data.monetagZoneId || '');
      setMonetagYmid(data.monetagYmid || '');
      setMonetagRequestVar(data.monetagRequestVar || '');
      setMonetagPreloadEnabled(data.monetagPreloadEnabled ?? true);
      setMonetagTimeout(String(data.monetagTimeout || 5));

      // In-App Interstitial
      const inApp = data.monetagInApp || DEFAULT_INAPP_SETTINGS;
      setInAppEnabled(inApp.enabled);
      setInAppFrequency(String(inApp.frequency));
      setInAppCapping(String(inApp.capping));
      setInAppInterval(String(inApp.interval));
      setInAppTimeout(String(inApp.timeout));
      setInAppEveryPage(inApp.everyPage);

      // Maintenance Mode
      setMaintenanceMode(data.maintenanceMode ?? false);
      setMaintenanceMessage(data.maintenanceMessage || '');
      setMaintenanceAllowAdmins(data.maintenanceAllowAdmins ?? true);

      // Language Settings
      const langSettings = data.languageSettings || DEFAULT_LANGUAGE_SETTINGS;
      setAutoDetectLanguage(langSettings.autoDetectLanguage);
      setDefaultLanguage(langSettings.defaultLanguage);
      setForceLanguage(langSettings.forceLanguage || null);
      setEnableIpDetection(langSettings.enableIpDetection ?? true);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const threshold = Math.max(1, Math.min(60, parseInt(adWatchThreshold) || 5));
    const gracePeriod = Math.max(1, Math.min(60, parseInt(adDetectionGracePeriod) || 10));
    const monetagTimeoutVal = Math.max(1, Math.min(30, parseInt(monetagTimeout) || 5));

    const inAppSettings: MonetagInAppSettings = {
      enabled: inAppEnabled,
      frequency: Math.max(1, Math.min(10, parseInt(inAppFrequency) || 3)),
      capping: Math.max(0.1, Math.min(24, parseFloat(inAppCapping) || 0.5)),
      interval: Math.max(30, Math.min(300, parseInt(inAppInterval) || 60)),
      timeout: Math.max(5, Math.min(60, parseInt(inAppTimeout) || 10)),
      everyPage: inAppEveryPage,
    };

    const langSettings: LanguageSettings = {
      defaultLanguage,
      autoDetectLanguage,
      supportedLanguages: ['en', 'bn'],
      forceLanguage: forceLanguage,  // Include even if null to clear previous value
      enableIpDetection,
    };

    setSaving(true);
    try {
      await updateSettings({
        adWatchThreshold: threshold,
        adDetectionGracePeriod: gracePeriod,
        hideTimerUI,
        primaryAdType,
        directLinkUrl: directLinkUrl || undefined,
        monetagZoneId: monetagZoneId || undefined,
        monetagYmid: monetagYmid || undefined,
        monetagRequestVar: monetagRequestVar || undefined,
        monetagPreloadEnabled,
        monetagTimeout: monetagTimeoutVal,
        monetagInApp: inAppSettings,
        // Keep legacy field for backward compatibility
        adsterraUrl: directLinkUrl || undefined,
        // Maintenance Mode
        maintenanceMode,
        maintenanceMessage: maintenanceMessage || undefined,
        maintenanceAllowAdmins,
        // Language Settings
        languageSettings: langSettings,
      });
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  // Check if Monetag config is needed
  const needsMonetagConfig = primaryAdType !== 'direct_link' || inAppEnabled;

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

        {/* Primary Ad Type Configuration */}
        <div className="card bg-base-200 shadow-sm max-w-lg">
          <div className="card-body">
            <h2 className="card-title">Primary Ad Type</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Choose the primary ad format users will see when unlocking content.
            </p>

            <div className="form-control">
              {AD_TYPE_OPTIONS.map((option) => (
                <label key={option.value} className="label cursor-pointer justify-start gap-3">
                  <input
                    type="radio"
                    name="primaryAdType"
                    value={option.value}
                    checked={primaryAdType === option.value}
                    onChange={(e) => setPrimaryAdType(e.target.value as PrimaryAdType)}
                    className="radio radio-primary"
                  />
                  <div className="flex flex-col">
                    <span className="label-text font-medium">{option.label}</span>
                    <span className="text-xs text-base-content/60">{option.description}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Link Settings - only shown when direct_link is selected */}
        {primaryAdType === 'direct_link' && (
          <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
            <div className="card-body">
              <h2 className="card-title">Direct Link Settings</h2>
              <p className="text-sm text-base-content/60 mb-4">
                Configure how direct link ads work. These settings control timer behavior and fallback options.
              </p>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Direct Link URL</span>
                </label>
                <input
                  type="url"
                  value={directLinkUrl}
                  onChange={(e) => setDirectLinkUrl(e.target.value)}
                  placeholder="https://example.com/ad-link"
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Works with Adsterra smartlinks, Monetag direct links, or any ad network URL
                  </span>
                </label>
              </div>

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
                    Minimum time user must keep ad window open before it counts (1-60)
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Grace Period (seconds)</span>
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
                    Time to wait before showing fallback "Claim Progress" option if window close detection fails (1-60)
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
                    Hide countdown timer, progress bar, and time-related messages from users
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Monetag SDK Configuration */}
        {needsMonetagConfig && (
          <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
            <div className="card-body">
              <h2 className="card-title">Monetag SDK Configuration</h2>
              <p className="text-sm text-base-content/60 mb-4">
                Configure the Monetag SDK for rewarded ads and background interstitials.
              </p>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Zone ID (Required)</span>
                </label>
                <input
                  type="text"
                  value={monetagZoneId}
                  onChange={(e) => setMonetagZoneId(e.target.value)}
                  placeholder="123456"
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Main zone ID from Monetag dashboard (required for SDK ads)
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">ymid (Optional)</span>
                </label>
                <input
                  type="text"
                  value={monetagYmid}
                  onChange={(e) => setMonetagYmid(e.target.value)}
                  placeholder="user-id-or-event-id"
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    User/event tracking ID for postbacks
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">requestVar (Optional)</span>
                </label>
                <input
                  type="text"
                  value={monetagRequestVar}
                  onChange={(e) => setMonetagRequestVar(e.target.value)}
                  placeholder="placement-name"
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Placement tracking for analytics
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Preload Ads</span>
                  <input
                    type="checkbox"
                    checked={monetagPreloadEnabled}
                    onChange={(e) => setMonetagPreloadEnabled(e.target.checked)}
                    className="toggle toggle-primary"
                  />
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Preload ads for faster display (recommended)
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ad Load Timeout (seconds)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={monetagTimeout}
                  onChange={(e) => setMonetagTimeout(e.target.value)}
                  className="input input-bordered"
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Max time to wait for ad to load (1-30 seconds)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* In-App Interstitial Settings */}
        <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">In-App Interstitial (Background Ads)</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Passive ads that automatically display at set intervals. Runs alongside primary ad type.
            </p>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable In-App Interstitial</span>
                <input
                  type="checkbox"
                  checked={inAppEnabled}
                  onChange={(e) => setInAppEnabled(e.target.checked)}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            {inAppEnabled && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Frequency (ads per session)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={inAppFrequency}
                    onChange={(e) => setInAppFrequency(e.target.value)}
                    className="input input-bordered"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Maximum ads to show per session (1-10)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Capping (session duration in hours)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    max={24}
                    value={inAppCapping}
                    onChange={(e) => setInAppCapping(e.target.value)}
                    className="input input-bordered"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Session duration (0.1 = 6 min, 0.5 = 30 min, 1 = 1 hour)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Interval (seconds between ads)</span>
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={inAppInterval}
                    onChange={(e) => setInAppInterval(e.target.value)}
                    className="input input-bordered"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Time between ads (30-300 seconds)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Initial Delay (seconds)</span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={inAppTimeout}
                    onChange={(e) => setInAppTimeout(e.target.value)}
                    className="input input-bordered"
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Delay before first ad appears (5-60 seconds)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Reset on Page Navigation</span>
                    <input
                      type="checkbox"
                      checked={inAppEveryPage}
                      onChange={(e) => setInAppEveryPage(e.target.checked)}
                      className="toggle toggle-primary"
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Reset session when user navigates between pages
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Maintenance Mode Settings */}
        <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">Maintenance Mode</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Temporarily block user access to the app for maintenance. Admins can bypass.
            </p>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Enable Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            {maintenanceMode && (
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Maintenance Message</span>
                  </label>
                  <textarea
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    placeholder="We're currently performing maintenance. Please check back soon!"
                    className="textarea textarea-bordered"
                    rows={3}
                  />
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Message shown to users during maintenance
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Allow Admins to Bypass</span>
                    <input
                      type="checkbox"
                      checked={maintenanceAllowAdmins}
                      onChange={(e) => setMaintenanceAllowAdmins(e.target.checked)}
                      className="toggle toggle-primary"
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Admins will see a dismissible banner instead of full block
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Language Settings */}
        <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
          <div className="card-body">
            <h2 className="card-title">Language Settings</h2>
            <p className="text-sm text-base-content/60 mb-4">
              Configure automatic language detection for user-facing UI. Admin UI always remains in English.
            </p>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Force Language</span>
              </label>
              <select
                value={forceLanguage || ''}
                onChange={(e) => setForceLanguage(e.target.value as SupportedLanguage || null)}
                className="select select-bordered"
              >
                <option value="">None (Auto-detect)</option>
                <option value="en">English</option>
                <option value="bn">বাংলা (Bangla)</option>
              </select>
              <label className="label">
                <span className="label-text-alt text-base-content/60">
                  {forceLanguage
                    ? 'All users will see this language (detection disabled)'
                    : 'Override all detection and force a specific language'}
                </span>
              </label>
            </div>

            {/* Only show detection settings when force language is not set */}
            {!forceLanguage && (
              <>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Auto-detect Language</span>
                    <input
                      type="checkbox"
                      checked={autoDetectLanguage}
                      onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                      className="toggle toggle-primary"
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Enable language detection (IP + Telegram settings)
                    </span>
                  </label>
                </div>

                {autoDetectLanguage && (
                  <div className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text">IP-based Detection</span>
                      <input
                        type="checkbox"
                        checked={enableIpDetection}
                        onChange={(e) => setEnableIpDetection(e.target.checked)}
                        className="toggle toggle-primary"
                      />
                    </label>
                    <label className="label">
                      <span className="label-text-alt text-base-content/60">
                        Detect language from user's IP location (priority over Telegram settings)
                      </span>
                    </label>
                  </div>
                )}

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Default Language</span>
                  </label>
                  <select
                    value={defaultLanguage}
                    onChange={(e) => setDefaultLanguage(e.target.value as SupportedLanguage)}
                    className="select select-bordered"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা (Bangla)</option>
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Fallback language when detection fails or is disabled
                    </span>
                  </label>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="card bg-base-200 shadow-sm max-w-lg mt-4">
          <div className="card-body">
            <div className="card-actions justify-end">
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
            <h2 className="card-title text-sm">About Ad Types</h2>
            <ul className="text-sm text-base-content/70 space-y-2">
              <li>
                <strong>Direct Link:</strong> Opens a URL in new window. Timer settings control how long users must keep it open. Best for Adsterra, Monetag direct links, or any ad network URL.
              </li>
              <li>
                <strong>Monetag Rewarded Interstitial:</strong> Full-screen SDK ad that automatically resolves when completed. No timer needed - SDK handles everything.
              </li>
              <li>
                <strong>Monetag Rewarded Popup:</strong> Opens advertiser page in new context. Resolves immediately when shown.
              </li>
              <li>
                <strong>In-App Interstitial:</strong> Passive background ads that show automatically at intervals. Requires Monetag SDK config. Runs alongside any primary ad type.
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
