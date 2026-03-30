import type { ComponentType } from 'react';

import AllPage from '@/pages/AllPage';
import FavoritesPage from '@/pages/FavoritesPage';
import UnlockedPage from '@/pages/UnlockedPage';
import ProfilePage from '@/pages/ProfilePage';
import UnlockableDetailPage from '@/pages/UnlockableDetailPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import UnlockablesPage from '@/pages/admin/UnlockablesPage';
import UnlockableFormPage from '@/pages/admin/UnlockableFormPage';
import UsersPage from '@/pages/admin/UsersPage';
import SettingsPage from '@/pages/admin/SettingsPage';

interface Route {
  path: string;
  Component: ComponentType;
}

export const routes: Route[] = [
  { path: '/', Component: AllPage },
  { path: '/favorites', Component: FavoritesPage },
  { path: '/unlocked', Component: UnlockedPage },
  { path: '/unlockable/:id', Component: UnlockableDetailPage },
  { path: '/profile', Component: ProfilePage },
  // Admin routes
  { path: '/admin', Component: AnalyticsPage },
  { path: '/admin/analytics', Component: AnalyticsPage },
  { path: '/admin/unlockables', Component: UnlockablesPage },
  { path: '/admin/unlockables/new', Component: UnlockableFormPage },
  { path: '/admin/unlockables/edit/:id', Component: UnlockableFormPage },
  { path: '/admin/users', Component: UsersPage },
  { path: '/admin/settings', Component: SettingsPage },
];
