import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import Layout from '@/components/Layout';
import { ArrowLeftIcon, HeartIcon, HeartFilledIcon, PhotoIcon, LinkIcon } from '@/components/Icons';

export default function UnlockableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unlockables, unlockedIds, isFavorite, toggleFavorite, loading } = useApp();
  const { t } = useTranslation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const unlockable = unlockables.find(u => u.id === id);
  const isUnlocked = id ? unlockedIds.has(id) : false;
  const favorite = id ? isFavorite(id) : false;

  useEffect(() => {
    // Reset image index when unlockable changes
    setCurrentIndex(0);
    setImageErrors(new Set());
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFavoriteClick = () => {
    if (id) {
      toggleFavorite(id);
    }
  };

  const handlePrev = useCallback(() => {
    if (unlockable && unlockable.content.length > 1) {
      setCurrentIndex(prev =>
        prev === 0 ? unlockable.content.length - 1 : prev - 1
      );
    }
  }, [unlockable]);

  const handleNext = useCallback(() => {
    if (unlockable && unlockable.content.length > 1) {
      setCurrentIndex(prev =>
        prev === unlockable.content.length - 1 ? 0 : prev + 1
      );
    }
  }, [unlockable]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => new Set(prev).add(index));
  };

  // Touch swipe handling
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    setTouchStart(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[80vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </Layout>
    );
  }

  if (!unlockable) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-base-content/60 mb-4">{t('empty.notFound')}</p>
          <button onClick={handleBack} className="btn btn-primary">
            {t('button.goBack')}
          </button>
        </div>
      </Layout>
    );
  }

  if (!isUnlocked) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <p className="text-base-content/60 mb-4">{t('empty.locked')}</p>
          <button onClick={handleBack} className="btn btn-primary">
            {t('button.goBack')}
          </button>
        </div>
      </Layout>
    );
  }

  const hasMultipleImages = unlockable.content.length > 1;
  const isLink = unlockable.type === 'link';
  const linkUrl = isLink ? unlockable.content[0] : null;

  const handleOpenLink = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
          <div className="flex items-center justify-between p-4">
            <button onClick={handleBack} className="btn btn-circle btn-sm btn-ghost">
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg line-clamp-1 flex-1 text-center px-2">
              {unlockable.title}
            </h1>
            <button
              onClick={handleFavoriteClick}
              className="btn btn-circle btn-sm btn-ghost"
            >
              {favorite ? (
                <HeartFilledIcon className="w-5 h-5 text-error" />
              ) : (
                <HeartIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {isLink ? (
          /* Link Content */
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="bg-base-200 rounded-2xl p-8 text-center max-w-sm w-full">
              <LinkIcon className="w-16 h-16 text-primary mx-auto mb-4" />
              <p className="text-base-content/70 mb-4">
                {t('content.containsLink')}
              </p>
              <button
                onClick={handleOpenLink}
                className="btn btn-primary btn-lg"
              >
                {t('button.openLink')}
              </button>
            </div>
          </div>
        ) : (
          /* Image Carousel */
          <div
            className="relative flex-1 bg-base-200 flex items-center justify-center min-h-[50vh]"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {unlockable.content[currentIndex] && !imageErrors.has(currentIndex) ? (
              <img
                key={currentIndex}
                src={unlockable.content[currentIndex]}
                alt={`${unlockable.title} - ${currentIndex + 1}`}
                className="w-full h-full max-h-[70vh] object-contain"
                onError={() => handleImageError(currentIndex)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <PhotoIcon className="w-16 h-16 text-base-content/30" />
                <p className="text-sm text-base-content/50 mt-2">{t('content.imageNotAvailable')}</p>
              </div>
            )}

            {/* Navigation arrows for multiple images */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none"
                >
                  ❮
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-circle btn-sm bg-base-100/80 hover:bg-base-100 border-none"
                >
                  ❯
                </button>
              </>
            )}

            {/* Image indicators */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {unlockable.content.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                      ? 'bg-primary w-4'
                      : 'bg-base-content/30'
                      }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Info */}
        <div className="p-4 bg-base-100">
          {/* Image counter (only for pictures) */}
          {!isLink && hasMultipleImages && (
            <p className="text-sm text-base-content/60 text-center mb-2">
              {currentIndex + 1} / {unlockable.content.length}
            </p>
          )}

          {/* Description */}
          {unlockable.description && (
            <p className="text-base-content/80 mb-4">
              {unlockable.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-outline">
              {isLink ? t('content.link') : `${unlockable.content.length} ${unlockable.content.length === 1 ? t('content.photo') : t('content.photos')}`}
            </span>
          </div>
        </div>
      </div>
    </Layout>
  );
}
