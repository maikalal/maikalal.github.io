import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { archiveUnlockable, unarchiveUnlockable, deleteUnlockable } from '@/firebase/firestore';
import { useApp } from '@/context/AppContext';
import { PlusIcon, PencilIcon, TrashIcon, ArchiveBoxIcon, ArrowPathIcon, PhotoIcon, LinkIcon } from '@/components/Icons';

export default function UnlockablesPage() {
  const { unlockables } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUnlockables = unlockables
    .filter(u => {
      if (filter === 'active') return !u.archived;
      if (filter === 'archived') return u.archived;
      return true;
    })
    .filter(u => u.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleArchive = async (id: string, currentlyArchived: boolean) => {
    if (!confirm(currentlyArchived ? 'Unarchive this item?' : 'Archive this item? It will be hidden from users but accessible to those who unlocked it.')) return;

    try {
      if (currentlyArchived) {
        await unarchiveUnlockable(id);
      } else {
        await archiveUnlockable(id);
      }
    } catch (error) {
      console.error('Error updating archive status:', error);
      alert('Failed to update. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this item? This cannot be undone and users who unlocked it will lose access.')) return;

    try {
      await deleteUnlockable(id);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Unlockables</h1>
          <Link to="/admin/unlockables/new" className="btn btn-primary btn-sm">
            <PlusIcon className="w-4 h-4" />
            Add New
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All ({unlockables.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Active ({unlockables.filter(u => !u.archived).length})
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`btn btn-sm ${filter === 'archived' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Archived ({unlockables.filter(u => u.archived).length})
          </button>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search unlockables..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full mb-4"
        />

        {/* List */}
        <div className="space-y-2">
          {filteredUnlockables.map(item => (
            <div
              key={item.id}
              className={`card bg-base-200 shadow-sm ${item.archived ? 'opacity-60' : ''}`}
            >
              <div className="card-body p-3 flex-row items-center gap-3">
                {/* Thumbnail */}
                <div className="w-12 h-12 rounded bg-base-300 flex items-center justify-center overflow-hidden">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : item.type === 'link' ? (
                    <LinkIcon className="w-6 h-6 text-base-content/30" />
                  ) : (
                    <PhotoIcon className="w-6 h-6 text-base-content/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <p className="text-xs text-base-content/60">
                    {item.type === 'link' ? 'Link' : `${item.content.length} ${item.content.length === 1 ? 'photo' : 'photos'}`} • {item.adsRequired} ads
                    {item.archived && <span className="text-warning ml-2">(Archived)</span>}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Link
                    to={`/admin/unlockables/edit/${item.id}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleArchive(item.id, !!item.archived)}
                    className={`btn btn-ghost btn-sm ${item.archived ? 'text-success' : ''}`}
                    title={item.archived ? 'Unarchive' : 'Archive'}
                  >
                    {item.archived ? (
                      <ArrowPathIcon className="w-4 h-4" />
                    ) : (
                      <ArchiveBoxIcon className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredUnlockables.length === 0 && (
            <div className="text-center py-8 text-base-content/60">
              No unlockables found.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
