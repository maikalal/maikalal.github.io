import { auth } from './config';

// Validate Telegram init data using a server-side approach
// In production, this should be validated on your backend
export function validateTelegramInitData(initData: string): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;
    
    // In development mode, skip validation
    if (import.meta.env.DEV) return true;
    
    // In production, you should validate the hash on your backend
    // For now, we'll check if required fields exist
    const user = urlParams.get('user');
    const authDate = urlParams.get('auth_date');
    
    return !!(user && authDate);
  } catch {
    return false;
  }
}

// Parse Telegram user from init data
export function parseTelegramUser(initData: string): {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
} | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const userJson = urlParams.get('user');
    
    if (!userJson) return null;
    
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

// Sign out
export async function signOutUser(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}
