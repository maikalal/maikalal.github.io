import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminStats } from '@/firebase/firestore';
import type { AdminStats } from '@/types';
import { UserIcon, CheckCircleIcon, CubeIcon } from '@/components/Icons';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

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
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Main Stats */}
        <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
          <div className="stat">
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-primary">{stats?.totalUsers || 0}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Unlockables</div>
            <div className="stat-value text-secondary">{stats?.totalUnlockables || 0}</div>
            <div className="stat-desc">
              {stats?.activeUnlockables || 0} active, {stats?.archivedUnlockables || 0} archived
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Ads Watched</div>
            <div className="stat-value text-accent">{stats?.totalAdsWatched || 0}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Items Unlocked</div>
            <div className="stat-value text-success">{stats?.totalUnlocked || 0}</div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="stats stats-vertical md:stats-horizontal shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-primary">
              <UserIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Admin Users</div>
            <div className="stat-value">{stats?.adminCount || 0}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <CheckCircleIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Active Unlockables</div>
            <div className="stat-value">{stats?.activeUnlockables || 0}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-warning">
              <CubeIcon className="w-8 h-8" />
            </div>
            <div className="stat-title">Archived Items</div>
            <div className="stat-value">{stats?.archivedUnlockables || 0}</div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-sm">Engagement Rate</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-base-content/60 mb-1">Unlock Rate</div>
                <progress
                  className="progress progress-primary w-full"
                  value={stats?.totalUnlocked || 0}
                  max={stats?.totalAdsWatched || 1}
                />
                <div className="text-xs text-base-content/40 mt-1">
                  {stats?.totalAdsWatched && stats.totalAdsWatched > 0
                    ? Math.round(((stats.totalUnlocked || 0) / stats.totalAdsWatched) * 100)
                    : 0}% of ad watches result in unlock
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
