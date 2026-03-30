import { NavLink } from 'react-router-dom';
import { ChartBarIcon, CubeIcon, UsersIcon, Cog6ToothIcon, HomeIcon } from '@/components/Icons';

const navItems = [
  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/admin/unlockables', label: 'Unlockables', icon: CubeIcon },
  { to: '/admin/users', label: 'Users', icon: UsersIcon },
  { to: '/admin/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  return (
    <div className="bg-base-200 text-base-content min-h-full w-64 p-4 flex flex-col" style={{ paddingTop: 'var(--tg-safe-area-inset-top, 0px)' }}>
      {/* Header */}
      <div className="mb-4 px-2">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>

      {/* Navigation */}
      <ul className="menu menu-sm flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                isActive ? 'active' : ''
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Back to App */}
      <ul className="menu menu-sm pt-4 border-t border-base-300">
        <li>
          <NavLink to="/">
            <HomeIcon className="w-5 h-5" />
            Back to App
          </NavLink>
        </li>
      </ul>
    </div>
  );
}
