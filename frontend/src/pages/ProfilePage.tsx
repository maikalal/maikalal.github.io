import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import Layout from '@/components/Layout';
import { UserIcon, CubeIcon, LockOpenIcon, HeartFilledIcon, ChartBarIcon, LanguageIcon } from '@/components/Icons';
import { updateUserLanguagePreference } from '@/firebase/firestore';
import type { SupportedLanguage } from '@/types';

export default function ProfilePage() {
  const { user, loading, error, unlockedIds, favorites, unlockables, refreshUser } = useApp();
  const { t } = useTranslation();
  const [savingLanguage, setSavingLanguage] = useState(false);

  async function handleLanguageChange(newLang: SupportedLanguage | '') {
    if (!user) return;

    setSavingLanguage(true);
    try {
      // Empty string means "Auto" - clear preference
      await updateUserLanguagePreference(user.telegramId, newLang || null);
      await refreshUser();
    } catch (err) {
      console.error('Failed to update language preference:', err);
    } finally {
      setSavingLanguage(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (error || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-error mb-2">{t('error.profile')}</p>
            <p className="text-sm text-base-content/60">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const stats = {
    total: unlockables.length,
    unlocked: unlockedIds.size,
    favorites: favorites.length,
    progress: unlockables.length > 0
      ? Math.round((unlockedIds.size / unlockables.length) * 100)
      : 0,
  };

  return (
    <Layout>
      <div className="p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6">{t('page.profile')}</h1>

        {/* User Card */}
        <div className="card bg-base-200 shadow-sm mb-6">
          <div className="card-body flex-row items-center gap-4">
            {/* Avatar */}
            <div className="avatar placeholder">
              {user.photoUrl ? (
                <div className="w-16 rounded-full">
                  <img src={user.photoUrl} alt={user.firstName} />
                </div>
              ) : (
                <div className="w-16 rounded-full bg-primary text-primary-content">
                  <UserIcon className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="card-title">
                {user.firstName} {user.lastName}
              </h2>
              {user.username && (
                <p className="text-sm text-base-content/60">@{user.username}</p>
              )}
              {user.role === 'admin' && (
                <span className="badge badge-primary badge-sm mt-1">Admin</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <CubeIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">{t('stats.totalItems')}</div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <LockOpenIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">{t('stats.unlocked')}</div>
            <div className="stat-value">{stats.unlocked}</div>
          </div>
        </div>

        <div className="stats shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-error">
              <HeartFilledIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">{t('stats.favorites')}</div>
            <div className="stat-value">{stats.favorites}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-info">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">{t('stats.progress')}</div>
            <div className="stat-value">{stats.progress}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card bg-base-200 shadow-sm mb-6">
          <div className="card-body">
            <h3 className="card-title text-sm">{t('stats.overallProgress')}</h3>
            <progress
              className="progress progress-primary w-full h-3"
              value={stats.unlocked}
              max={stats.total || 1}
            />
            <p className="text-xs text-base-content/60 text-center">
              {stats.unlocked} {t('content.of')} {stats.total} {t('stats.itemsUnlocked')}
            </p>
          </div>
        </div>

        {/* Language Settings - subtle footer */}
        <div className="flex items-center justify-between gap-3 py-3 px-4 bg-base-200/50 rounded-lg">
          <span className="text-sm text-base-content/70 flex items-center gap-2">
            <LanguageIcon className="w-4 h-4" />
            {t('settings.language')}
          </span>
          <select
            value={user.preferredLanguage || ''}
            onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage | '')}
            disabled={savingLanguage}
            className="select select-ghost select-sm w-32"
          >
            <option value="">{t('settings.languageAuto')}</option>
            <option value="en">English</option>
            <option value="bn">বাংলা</option>
          </select>
        </div>
      </div>
    </Layout>
  );
}
