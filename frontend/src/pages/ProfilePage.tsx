import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import { UserIcon, CubeIcon, LockOpenIcon, HeartFilledIcon, ChartBarIcon } from '@/components/Icons';

export default function ProfilePage() {
  const { user, loading, error, unlockedIds, favorites, unlockables } = useApp();

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
            <p className="text-error mb-2">Error loading profile</p>
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
        <h1 className="text-2xl font-bold mb-6">Profile</h1>

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
            <div className="stat-title">Total Items</div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-success">
              <LockOpenIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">Unlocked</div>
            <div className="stat-value">{stats.unlocked}</div>
          </div>
        </div>

        <div className="stats shadow w-full mb-6">
          <div className="stat">
            <div className="stat-figure text-error">
              <HeartFilledIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">Favorites</div>
            <div className="stat-value">{stats.favorites}</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-info">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="stat-title">Progress</div>
            <div className="stat-value">{stats.progress}%</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-sm">Overall Progress</h3>
            <progress
              className="progress progress-primary w-full h-3"
              value={stats.unlocked}
              max={stats.total || 1}
            />
            <p className="text-xs text-base-content/60 text-center">
              {stats.unlocked} of {stats.total} items unlocked
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
