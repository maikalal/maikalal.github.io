import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { createUnlockable, updateUnlockable, getUnlockableById } from '@/firebase/firestore';
import { uploadFile, isValidImageFile } from '@/helpers/upload';
import { useApp } from '@/context/AppContext';
import { XMarkIcon, PlusIcon } from '@/components/Icons';

interface ContentItem {
  id: string;
  url: string;
  file: File | null;
  preview: string;
}

interface FormData {
  title: string;
  description: string;
  type: 'picture' | 'link';
  thumbnail: string;
  adsRequired: string;
}

const initialFormData: FormData = {
  title: '',
  description: '',
  type: 'picture',
  thumbnail: '',
  adsRequired: '1',
};

export default function UnlockableFormPage() {
  const { user } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const contentInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;

  useEffect(() => {
    if (id) {
      loadUnlockable(id);
    }
  }, [id]);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      contentItems.forEach(item => {
        if (item.preview) URL.revokeObjectURL(item.preview);
      });
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, []);

  async function loadUnlockable(unlockableId: string) {
    setLoading(true);
    try {
      const unlockable = await getUnlockableById(unlockableId);
      if (unlockable) {
        setFormData({
          title: unlockable.title,
          description: unlockable.description || '',
          type: unlockable.type || 'picture',
          thumbnail: unlockable.thumbnail || '',
          adsRequired: String(unlockable.adsRequired),
        });
        // Set link URL if type is link
        if (unlockable.type === 'link' && unlockable.content[0]) {
          setLinkUrl(unlockable.content[0]);
        } else {
          // Convert content array to content items for pictures
          setContentItems(
            unlockable.content.map((url, index) => ({
              id: `existing-${index}`,
              url,
              file: null,
              preview: '',
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading unlockable:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleContentFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: ContentItem[] = [];

    Array.from(files).forEach(file => {
      if (!isValidImageFile(file)) {
        alert(`Skipping ${file.name}: Not a valid image file (JPEG, PNG, GIF, or WebP)`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        alert(`Skipping ${file.name}: File size must be less than 10MB`);
        return;
      }

      newItems.push({
        id: `new-${Date.now()}-${Math.random()}`,
        url: '',
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (newItems.length > 0) {
      setContentItems(prev => [...prev, ...newItems]);
    }

    // Reset input
    if (contentInputRef.current) {
      contentInputRef.current.value = '';
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImageFile(file)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailPreview(URL.createObjectURL(file));
    setThumbnailFile(file);
    setFormData(prev => ({ ...prev, thumbnail: '' }));
  };

  const removeContentItem = (itemId: string) => {
    setContentItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item?.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(i => i.id !== itemId);
    });
  };

  const clearThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
    setThumbnailPreview('');
    setThumbnailFile(null);
    setFormData(prev => ({ ...prev, thumbnail: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    // Validate content based on type
    if (formData.type === 'picture' && contentItems.length === 0) {
      alert('At least one content image is required');
      return;
    }

    if (formData.type === 'link' && !linkUrl.trim()) {
      alert('Link URL is required');
      return;
    }

    setSubmitting(true);
    try {
      let contentUrls: string[];

      if (formData.type === 'link') {
        // For links, content is just the URL
        contentUrls = [linkUrl.trim()];
      } else {
        // For pictures, upload all content files
        contentUrls = [];

        for (const item of contentItems) {
          if (item.file) {
            const result = await uploadFile(item.file);
            if (result.success && result.url) {
              contentUrls.push(result.url);
            } else {
              throw new Error(result.error || 'Failed to upload content image');
            }
          } else if (item.url) {
            contentUrls.push(item.url);
          }
        }
      }

      // Upload thumbnail if new
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        const result = await uploadFile(thumbnailFile);
        if (result.success && result.url) {
          thumbnailUrl = result.url;
        } else {
          throw new Error(result.error || 'Failed to upload thumbnail');
        }
      }

      const adsRequiredNum = Math.max(1, Math.min(100, parseInt(formData.adsRequired) || 1));

      if (isEditing && id) {
        await updateUnlockable(id, {
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          content: contentUrls,
          thumbnail: thumbnailUrl || undefined,
          adsRequired: adsRequiredNum,
        });
      } else {
        await createUnlockable({
          title: formData.title,
          description: formData.description || undefined,
          type: formData.type,
          content: contentUrls,
          thumbnail: thumbnailUrl || undefined,
          adsRequired: adsRequiredNum,
          createdBy: user.id,
        });
      }
      navigate('/admin/unlockables');
    } catch (error) {
      console.error('Error saving unlockable:', error);
      alert(error instanceof Error ? error.message : 'Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Unlockable' : 'Add New Unlockable'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Title *</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Type *</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'picture' | 'link' })}
              className="select select-bordered"
            >
              <option value="picture">Picture</option>
              <option value="link">Link</option>
            </select>
          </div>

          {/* Content field - different based on type */}
          {formData.type === 'link' ? (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Link URL *</span>
              </label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="input input-bordered"
                required
              />
            </div>
          ) : (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Content Images * ({contentItems.length} added)</span>
              </label>

              {/* Upload button */}
              <input
                ref={contentInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleContentFilesChange}
                className="file-input file-input-bordered w-full"
                disabled={submitting}
              />

              {/* Content items grid */}
              {contentItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {contentItems.map((item) => (
                    <div key={item.id} className="relative aspect-square">
                      <img
                        src={item.preview || item.url}
                        alt="Content"
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeContentItem(item.id)}
                        className="absolute top-1 right-1 btn btn-circle btn-xs btn-ghost bg-base-100/80"
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add more button */}
                  <label className="aspect-square flex items-center justify-center border-2 border-dashed border-base-300 rounded cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleContentFilesChange}
                      className="hidden"
                      disabled={submitting}
                    />
                    <PlusIcon className="w-6 h-6 text-base-content/40" />
                  </label>
                </div>
              )}
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Thumbnail</span>
            </label>
            <div className="space-y-2">
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailFileChange}
                className="file-input file-input-bordered w-full"
                disabled={submitting}
              />
              {(thumbnailPreview || formData.thumbnail) && (
                <div className="relative">
                  <img
                    src={thumbnailPreview || formData.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={clearThumbnail}
                    className="absolute top-2 right-2 btn btn-circle btn-xs btn-ghost bg-base-100/80"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Ads Required *</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={formData.adsRequired}
              onChange={(e) => setFormData({ ...formData, adsRequired: e.target.value })}
              onBlur={() => {
                const val = parseInt(formData.adsRequired);
                if (!val || val < 1) setFormData({ ...formData, adsRequired: '1' });
                else if (val > 100) setFormData({ ...formData, adsRequired: '100' });
              }}
              className="input input-bordered"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate('/admin/unlockables')}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
