import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import Layout from '@/components/Layout';
import SearchBar from '@/components/SearchBar';
import UnlockableList from '@/components/UnlockableList';
import AdViewModal from '@/components/AdViewModal';
import type { Unlockable } from '@/types';

export default function AllPage() {
  const { unlockables, loading, error, watchAd } = useApp();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnlockable, setSelectedUnlockable] = useState<Unlockable | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);

  // Filter out archived unlockables for public view
  const activeUnlockables = unlockables.filter(u => !u.archived);

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

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-error mb-2">{t('error.loading')}</p>
            <p className="text-sm text-base-content/60">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">{t('page.unlockables')}</h1>

        {/* Search */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('search.unlockables')}
          />
        </div>

        {/* List */}
        <UnlockableList
          unlockables={activeUnlockables}
          searchQuery={searchQuery}
          onUnlock={handleUnlock}
          emptyMessage={t('empty.noUnlockables')}
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
