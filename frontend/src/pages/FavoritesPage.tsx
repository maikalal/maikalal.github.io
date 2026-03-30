import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import UnlockableList from '@/components/UnlockableList';
import AdViewModal from '@/components/AdViewModal';
import type { Unlockable } from '@/types';

export default function FavoritesPage() {
  const { unlockables, favorites, loading, watchAd } = useApp();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnlockable, setSelectedUnlockable] = useState<Unlockable | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);

  const favoriteUnlockables = useMemo(() => {
    const favoriteIds = new Set(favorites.map(f => f.unlockableId));
    return unlockables.filter(u => favoriteIds.has(u.id) && !u.archived);
  }, [unlockables, favorites]);

  const handleUnlock = (unlockable: Unlockable) => {
    setSelectedUnlockable(unlockable);
    setShowAdModal(true);
  };

  const handleAdComplete = async () => {
    if (selectedUnlockable) {
      await watchAd(selectedUnlockable.id);
    }
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
        <h1 className="text-2xl font-bold mb-4">{t('page.favorites')}</h1>

        {/* Search */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('search.favorites')}
          />
        </div>

        {/* List */}
        <UnlockableList
          unlockables={favoriteUnlockables}
          searchQuery={searchQuery}
          onUnlock={handleUnlock}
          emptyMessage={t('empty.noFavorites')}
        />
      </div>

      {/* Ad Modal */}
      <AdViewModal
        unlockable={selectedUnlockable}
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
    </Layout>
  );
}
