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
    if (!searchQuery.trim()) return unlockables;

    const query = searchQuery.toLowerCase();
    return unlockables.filter(
      item =>
        item.title.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
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
