import { useMemo } from 'react';
import { useTranslation } from '@/i18n';
import type { Unlockable } from '@/types';
import UnlockableCard from './UnlockableCard';

interface UnlockableListProps {
  unlockables: Unlockable[];
  searchQuery: string;
  onUnlock: (unlockable: Unlockable) => void;
  emptyMessage?: string;
}

export default function UnlockableList({
  unlockables,
  searchQuery,
  onUnlock,
  emptyMessage,
}: UnlockableListProps) {
  const { t } = useTranslation();
  const defaultMessage = t('empty.noItems');

  const filteredItems = useMemo(() => {
    let items = unlockables;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );
    }

    // Sort: favorites → unlocked → latest
    return [...items].sort((a, b) => {
      // 1. Favorites first (most to least)
      const aFavoriteCount = a.favoriteCount || 0;
      const bFavoriteCount = b.favoriteCount || 0;
      if (bFavoriteCount !== aFavoriteCount) {
        return bFavoriteCount - aFavoriteCount;
      }

      // 2. Unlocked count (most to least)
      const aUnlockCount = a.unlockCount || 0;
      const bUnlockCount = b.unlockCount || 0;
      if (bUnlockCount !== aUnlockCount) {
        return bUnlockCount - aUnlockCount;
      }

      // 3. Latest first
      const aDate = a.createdAt?.getTime() || 0;
      const bDate = b.createdAt?.getTime() || 0;
      return bDate - aDate;
    });
  }, [unlockables, searchQuery]);

  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-base-content/50">
        <p>{emptyMessage || defaultMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {filteredItems.map(item => (
        <UnlockableCard
          key={item.id}
          unlockable={item}
          onUnlock={onUnlock}
        />
      ))}
    </div>
  );
}
