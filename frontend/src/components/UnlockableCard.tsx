import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import type { Unlockable } from '@/types';
import { HeartIcon, HeartFilledIcon, LockOpenIcon, PhotoIcon } from './Icons';

interface UnlockableCardProps {
  unlockable: Unlockable;
  onUnlock: (unlockable: Unlockable) => void;
}

export default function UnlockableCard({ unlockable, onUnlock }: UnlockableCardProps) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite, isUnlocked, getProgress } = useApp();
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const favorite = isFavorite(unlockable.id);
  const unlocked = isUnlocked(unlockable.id);
  const progress = getProgress(unlockable.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(unlockable.id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unlocked) {
      navigate(`/unlockable/${unlockable.id}`);
    } else {
      onUnlock(unlockable);
    }
  };

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
      <figure className="relative h-40 bg-base-300">
        {unlockable.thumbnail && !imageError ? (
          <img
            src={unlockable.thumbnail}
            alt={unlockable.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <PhotoIcon className="w-12 h-12 text-base-content/30" />
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none"
        >
          {favorite ? (
            <HeartFilledIcon className="w-5 h-5 text-error" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
        </button>

        {/* Unlocked badge */}
        {unlocked && (
          <div className="absolute bottom-2 right-2 badge badge-success badge-sm gap-1">
            <LockOpenIcon className="w-3 h-3" />
            {t('stats.unlocked')}
          </div>
        )}
      </figure>

      <div className="card-body p-3">
        <h3 className="card-title text-sm line-clamp-1">{unlockable.title}</h3>

        {unlockable.description && (
          <p className="text-xs text-base-content/70 line-clamp-2">
            {unlockable.description}
          </p>
        )}

        {/* Progress bar */}
        {!unlocked && (
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{progress.watched}/{progress.required} {t('stats.adsWatched')}</span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <progress
              className="progress progress-primary w-full h-2"
              value={progress.watched}
              max={progress.required}
            />
          </div>
        )}

        <button
          onClick={handleActionClick}
          className={`btn btn-sm mt-2 ${unlocked ? 'btn-primary' : 'btn-secondary'}`}
        >
          {unlocked ? t('button.view') : t('button.watchAd')}
        </button>
      </div>
    </div>
  );
}
