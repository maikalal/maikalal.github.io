import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import { WrenchScrewdriverIcon, XMarkIcon } from './Icons';

interface MaintenanceOverlayProps {
  children: React.ReactNode;
}

export default function MaintenanceOverlay({ children }: MaintenanceOverlayProps) {
  const { user, settings } = useApp();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  const isMaintenanceMode = settings?.maintenanceMode ?? false;
  const allowAdmins = settings?.maintenanceAllowAdmins ?? true;
  const message = settings?.maintenanceMessage || t('maintenance.message');
  const isAdmin = user?.role === 'admin';

  // Not in maintenance mode - show app normally
  if (!isMaintenanceMode) {
    return <>{children}</>;
  }

  // Admin with allowAdmins - show banner (dismissible)
  if (isAdmin && allowAdmins) {
    return (
      <>
        {/* Admin banner at top */}
        <div className="fixed top-0 left-0 right-0 bg-warning text-warning-content z-[60] px-4 py-2 text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-4 h-4" />
            {t('maintenance.adminNotice')}
          </span>
          <button
            onClick={() => setDismissed(!dismissed)}
            className="btn btn-ghost btn-xs"
          >
            {dismissed ? t('maintenance.showOverlay') : <XMarkIcon className="w-4 h-4" />}
          </button>
        </div>
        <div className={dismissed ? '' : 'pt-10'}>
          {children}
        </div>
      </>
    );
  }

  // Regular user or admin not allowed - show full overlay
  return (
    <div className="fixed inset-0 z-[60] bg-base-100 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <WrenchScrewdriverIcon className="w-16 h-16 mx-auto mb-4 text-warning" />
        <h1 className="text-2xl font-bold mb-2">{t('maintenance.title')}</h1>
        <p className="text-base-content/70 mb-4">{message}</p>
        <p className="text-sm text-base-content/50">{t('maintenance.checkLater')}</p>
      </div>
    </div>
  );
}
