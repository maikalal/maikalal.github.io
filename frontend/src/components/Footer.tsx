import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useTranslation } from '@/i18n';
import {
  HomeIcon,
  HeartIcon,
  UnlockIcon,
  UserIcon,
  Cog6ToothIcon
} from './Icons';

export default function Footer() {
  const { user, unlockedIds, favoriteIds } = useApp();
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { path: '/', label: t('nav.all'), icon: HomeIcon },
    { path: '/favorites', label: t('nav.favorites'), icon: HeartIcon, badge: favoriteIds.size },
    { path: '/unlocked', label: t('nav.unlocked'), icon: UnlockIcon, badge: unlockedIds.size },
    { path: '/profile', label: t('nav.profile'), icon: UserIcon },
  ];

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-base-200 border-t border-base-300 z-50" style={{ paddingBottom: 'var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom))' }}>
      <nav className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, label, icon: Icon, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors relative ${isActive
                ? 'text-primary'
                : 'text-base-content/60 hover:text-base-content'
              }`
            }
          >
            <div className="relative">
              <Icon className="w-6 h-6" />
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-content text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${isAdminRoute
              ? 'text-primary'
              : 'text-base-content/60 hover:text-base-content'
              }`}
          >
            <Cog6ToothIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Admin</span>
          </NavLink>
        )}
      </nav>
    </footer>
  );
}
