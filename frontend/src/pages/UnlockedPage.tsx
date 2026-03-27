import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import UnlockableList from '@/components/UnlockableList';
import type { Unlockable } from '@/types';

export default function UnlockedPage() {
  const { unlockables, unlockedIds, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const unlockedUnlockables = useMemo(() => {
    return unlockables.filter(u => unlockedIds.has(u.id));
  }, [unlockables, unlockedIds]);

  const handleUnlock = (_unlockable: Unlockable) => {
    // Already unlocked, navigation handled by UnlockableCard
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">Unlocked</h1>

        {/* Search */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search unlocked items..."
          />
        </div>

        {/* Stats */}
        <div className="stats shadow mb-4 w-full">
          <div className="stat">
            <div className="stat-title">Total Unlocked</div>
            <div className="stat-value text-primary">{unlockedUnlockables.length}</div>
          </div>
        </div>

        {/* List */}
        <UnlockableList
          unlockables={unlockedUnlockables}
          searchQuery={searchQuery}
          onUnlock={handleUnlock}
          emptyMessage="No unlocked items yet. Watch ads to unlock content!"
        />
      </div>
    </Layout>
  );
}
