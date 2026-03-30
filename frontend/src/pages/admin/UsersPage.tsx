import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getUsersPaginated, searchUsers, updateUserRoleById } from '@/firebase/firestore';
import type { User } from '@/types';
import { UserIcon, MagnifyingGlassIcon } from '@/components/Icons';

const PAGE_SIZE = 20;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers(append: boolean = false) {
    try {
      setLoading(true);
      const result = await getUsersPaginated(PAGE_SIZE, append ? lastDoc : undefined);
      
      if (append) {
        setUsers(prev => [...prev, ...result.users]);
      } else {
        setUsers(result.users);
      }
      
      setLastDoc(result.lastDoc);
      setHasMore(result.users.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      loadUsers();
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setUsers(results);
      setHasMore(false);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  }

  async function handleRoleChange(userId: string, currentRole: 'user' | 'admin') {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    
    try {
      await updateUserRoleById(userId, newRole);
      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. Please try again.');
    }
  }

  function clearSearch() {
    setSearchQuery('');
    loadUsers();
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">Users</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pr-10"
            />
            <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? <span className="loading loading-spinner loading-sm"></span> : 'Search'}
          </button>
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="btn btn-ghost">
              Clear
            </button>
          )}
        </form>

        {/* Users List */}
        <div className="space-y-2">
          {users.map(user => (
            <div key={user.id} className="card bg-base-200 shadow-sm">
              <div className="card-body p-3 flex-row items-center gap-3">
                {/* Avatar */}
                <div className="avatar placeholder">
                  {user.photoUrl ? (
                    <div className="w-12 rounded-full">
                      <img src={user.photoUrl} alt={user.firstName} />
                    </div>
                  ) : (
                    <div className="w-12 rounded-full bg-primary text-primary-content">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-xs text-base-content/60">
                    {user.username && `@${user.username}`}
                    <span className="ml-2">ID: {user.telegramId}</span>
                  </p>
                </div>

                {/* Role Badge */}
                <div className="flex items-center gap-2">
                  <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                    {user.role}
                  </span>
                  <button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    className="btn btn-xs btn-ghost"
                    title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                  >
                    {user.role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {users.length === 0 && !loading && (
            <div className="text-center py-8 text-base-content/60">
              No users found.
            </div>
          )}
        </div>

        {/* Load More */}
        {hasMore && !searchQuery && (
          <div className="mt-4 text-center">
            <button
              onClick={() => loadUsers(true)}
              disabled={loading}
              className="btn btn-ghost"
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
