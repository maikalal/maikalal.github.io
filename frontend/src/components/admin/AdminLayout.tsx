import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Mobile navbar */}
        <div className="navbar bg-base-200 lg:hidden shrink-0">
          <div className="flex-none">
            <label htmlFor="admin-drawer" className="btn btn-square btn-ghost drawer-button">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <span className="text-lg font-bold">Admin Panel</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <AdminSidebar />
      </div>
    </div>
  );
}
