import { signInAnonymously, UserCredential } from 'firebase/auth';
import { auth, db } from './config';
import { createUser, getUserByTelegramId } from './firestore';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

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

// Sign in with Telegram
export async function signInWithTelegram(initData: string): Promise<{
  success: boolean;
  user?: UserCredential;
  error?: string;
}> {
  try {
    // Validate init data
    if (!validateTelegramInitData(initData)) {
      return { success: false, error: 'Invalid Telegram init data' };
    }
    
    // Parse Telegram user
    const telegramUser = parseTelegramUser(initData);
    
    if (!telegramUser) {
      return { success: false, error: 'Could not parse Telegram user' };
    }
    
    // Check if user exists in Firestore
    let user = await getUserByTelegramId(telegramUser.id);
    
    if (!user) {
      // Create new user
      user = await createUser({
        telegramId: telegramUser.id,
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name,
        username: telegramUser.username,
        photoUrl: telegramUser.photo_url,
        role: 'user',
      });
    } else {
      // Update user info in case it changed
      const userRef = doc(db, 'users', telegramUser.id.toString());
      const updateData = {
        firstName: telegramUser.first_name,
        ...(telegramUser.last_name && { lastName: telegramUser.last_name }),
        ...(telegramUser.username && { username: telegramUser.username }),
        ...(telegramUser.photo_url && { photoUrl: telegramUser.photo_url }),
        lastLogin: Timestamp.now(),
      };
      await setDoc(userRef, updateData, { merge: true });
    }
    
    // Sign in anonymously to Firebase
    // In production, you'd use a custom token from your backend
    const credential = await signInAnonymously(auth);
    
    return { success: true, user: credential };
  } catch (error) {
    console.error('Error signing in with Telegram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
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
