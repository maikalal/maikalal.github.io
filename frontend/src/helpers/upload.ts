const R2_WORKER_URL = import.meta.env.VITE_R2_WORKER_URL || '';
const UPLOAD_TOKEN = import.meta.env.VITE_UPLOAD_TOKEN || '';

export interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  if (!R2_WORKER_URL) {
    return { success: false, error: 'R2 worker URL not configured' };
  }

  if (!UPLOAD_TOKEN) {
    return { success: false, error: 'Upload token not configured' };
  }

  // Ensure URL has protocol
  const baseUrl = R2_WORKER_URL.startsWith('http') ? R2_WORKER_URL : `https://${R2_WORKER_URL}`;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${UPLOAD_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.error || 'Upload failed' };
    }

    return {
      success: true,
      url: data.url,
      key: data.key,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
