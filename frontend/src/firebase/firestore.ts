import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  addDoc,
  getCountFromServer,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import type { User, Unlockable, UserUnlockable, UserFavorite, AppSettings, AdminStats, SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE_SETTINGS } from '@/i18n/constants';

// Users Collection
const USERS_COLLECTION = 'users';
const UNLOCKABLES_COLLECTION = 'unlockables';
const SETTINGS_COLLECTION = 'settings';

// User Operations
export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  // Always use telegramId as document ID for consistent lookups across sessions
  const docId = userData.telegramId.toString();
  const userRef = doc(collection(db, USERS_COLLECTION), docId);
  const now = Timestamp.now();
  
  // Filter out undefined values
  const filteredData = {
    telegramId: userData.telegramId,
    firstName: userData.firstName,
    ...(userData.lastName && { lastName: userData.lastName }),
    ...(userData.username && { username: userData.username }),
    ...(userData.photoUrl && { photoUrl: userData.photoUrl }),
    ...(userData.firebaseUid && { firebaseUid: userData.firebaseUid }),
    role: userData.role,
    createdAt: now,
  };
  
  await setDoc(userRef, filteredData, { merge: true });
  
  return {
    ...userData,
    id: docId,
    createdAt: now.toDate(),
  };
}

export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  // Use direct doc lookup - document ID is telegramId
  // This works with security rules that restrict read to owner or admin
  const docId = telegramId.toString();
  const docRef = doc(db, USERS_COLLECTION, docId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    ...data,
    id: docId,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as User;
}

export async function getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
  // First lookup telegramId from auth_mappings
  const mappingRef = doc(db, AUTH_MAPPINGS_COLLECTION, firebaseUid);
  const mappingSnap = await getDoc(mappingRef);

  if (!mappingSnap.exists()) return null;

  const telegramId = String(mappingSnap.data().telegramId);
  const userRef = doc(db, USERS_COLLECTION, telegramId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    ...data,
    id: userSnap.id,
    createdAt: data.createdAt?.toDate() || new Date(),
  } as User;
}

export async function updateUserRole(telegramId: number, role: 'user' | 'admin'): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, telegramId.toString());
  await updateDoc(userRef, { role });
}

export async function updateUserFirebaseUid(telegramId: number, firebaseUid: string): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, telegramId.toString());
  await updateDoc(userRef, { firebaseUid });
}

export async function updateUserLanguagePreference(
  telegramId: number, 
  language: SupportedLanguage | null
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, telegramId.toString());
  // Use updateDoc with field path to properly handle null (delete field if null)
  if (language === null) {
    // Delete the field to use auto-detection
    await updateDoc(userRef, { preferredLanguage: deleteField() });
  } else {
    await updateDoc(userRef, { preferredLanguage: language });
  }
}

// Auth Mapping Operations
// Maps firebaseUid to telegramId for Firestore security rules
const AUTH_MAPPINGS_COLLECTION = 'auth_mappings';

export async function createAuthMapping(firebaseUid: string, telegramId: number): Promise<void> {
  const mappingRef = doc(db, AUTH_MAPPINGS_COLLECTION, firebaseUid);
  await setDoc(mappingRef, { telegramId, updatedAt: Timestamp.now() }, { merge: true });
}

// Unlockables Operations
export async function createUnlockable(unlockable: Omit<Unlockable, 'id' | 'createdAt'>): Promise<Unlockable> {
  const colRef = collection(db, UNLOCKABLES_COLLECTION);
  const now = Timestamp.now();
  
  // Filter out undefined values to prevent Firestore errors
  const filteredData = {
    title: unlockable.title,
    type: unlockable.type,
    content: unlockable.content,
    adsRequired: unlockable.adsRequired,
    createdBy: unlockable.createdBy,
    ...(unlockable.description && { description: unlockable.description }),
    ...(unlockable.thumbnail && { thumbnail: unlockable.thumbnail }),
    ...(unlockable.archived && { archived: unlockable.archived }),
    createdAt: now,
  };
  
  const docRef = await addDoc(colRef, filteredData);
  
  return {
    ...unlockable,
    id: docRef.id,
    createdAt: now.toDate(),
  };
}

export async function getAllUnlockables(): Promise<Unlockable[]> {
  const colRef = collection(db, UNLOCKABLES_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as Unlockable[];
}

export async function getUnlockableById(id: string): Promise<Unlockable | null> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    ...snapshot.data(),
    id: snapshot.id,
    createdAt: snapshot.data().createdAt?.toDate() || new Date(),
  } as Unlockable;
}

export async function updateUnlockable(id: string, data: Partial<Unlockable>): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  
  // Filter out undefined values to prevent Firestore errors
  const filteredData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      filteredData[key] = value;
    }
  }
  
  await updateDoc(docRef, filteredData);
}

export async function deleteUnlockable(id: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  await deleteDoc(docRef);
}

// User Unlockables Operations
export async function getUserUnlockable(userId: string, unlockableId: string): Promise<UserUnlockable | null> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'unlockables', unlockableId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    ...snapshot.data(),
    id: snapshot.id,
    unlockableId: snapshot.id,
    unlockedAt: snapshot.data().unlockedAt?.toDate(),
  } as UserUnlockable;
}

export async function getUserUnlockables(userId: string): Promise<UserUnlockable[]> {
  const colRef = collection(db, USERS_COLLECTION, userId, 'unlockables');
  const snapshot = await getDocs(colRef);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    unlockableId: doc.id,
    unlockedAt: doc.data().unlockedAt?.toDate(),
  })) as UserUnlockable[];
}

export async function incrementAdsWatched(userId: string, unlockableId: string): Promise<UserUnlockable> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'unlockables', unlockableId);
  const existing = await getDoc(docRef);
  
  if (!existing.exists()) {
    // Fetch unlockable to get adsRequired for security rule enforcement
    const unlockable = await getUnlockableById(unlockableId);
    const adsRequired = unlockable?.adsRequired ?? 1;
    
    const newData = {
      adsRequired,  // Denormalized for security rules
      adsWatched: 1,
      unlocked: false,
    };
    await setDoc(docRef, newData);
    return { id: unlockableId, unlockableId, ...newData } as UserUnlockable;
  }
  
  const currentData = existing.data();
  const newAdsWatched = (currentData.adsWatched || 0) + 1;
  
  await updateDoc(docRef, {
    adsWatched: newAdsWatched,
  });
  
  return {
    ...currentData,
    id: unlockableId,
    unlockableId,
    adsWatched: newAdsWatched,
  } as UserUnlockable;
}

export async function unlockItem(userId: string, unlockableId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'unlockables', unlockableId);
  
  await updateDoc(docRef, {
    unlocked: true,
    unlockedAt: Timestamp.now(),
  });
  
  // Increment unlock counter on the unlockable
  await incrementUnlockCount(unlockableId);
}

// Increment unlock counter on an unlockable
export async function incrementUnlockCount(unlockableId: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, unlockableId);
  // Use atomic increment to avoid race conditions
  await updateDoc(docRef, { unlockCount: increment(1) });
}

// Increment favorite counter on an unlockable
export async function incrementFavoriteCount(unlockableId: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, unlockableId);
  // Use atomic increment to avoid race conditions
  await updateDoc(docRef, { favoriteCount: increment(1) });
}

// Decrement favorite counter on an unlockable
export async function decrementFavoriteCount(unlockableId: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, unlockableId);
  // Use atomic increment(-1) to avoid race conditions
  // Note: Firestore allows negative values, but we rely on security rules
  // to prevent decrementing below 0 (rule requires +/- 1 change)
  await updateDoc(docRef, { favoriteCount: increment(-1) });
}

// User Favorites Operations
export async function addFavorite(userId: string, unlockableId: string): Promise<UserFavorite> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', unlockableId);
  const now = Timestamp.now();
  
  await setDoc(docRef, {
    addedAt: now,
  });
  
  // Increment favorite counter on the unlockable
  await incrementFavoriteCount(unlockableId);
  
  return {
    id: unlockableId,
    unlockableId,
    addedAt: now.toDate(),
  };
}

export async function removeFavorite(userId: string, unlockableId: string): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', unlockableId);
  await deleteDoc(docRef);
  
  // Decrement favorite counter on the unlockable
  await decrementFavoriteCount(unlockableId);
}

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const colRef = collection(db, USERS_COLLECTION, userId, 'favorites');
  const snapshot = await getDocs(colRef);
  
  const favorites = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    unlockableId: doc.id,
    addedAt: doc.data().addedAt?.toDate() || new Date(),
  })) as UserFavorite[];
  
  // Sort in-memory to avoid Firestore index requirement
  favorites.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  
  return favorites;
}

export async function isFavorite(userId: string, unlockableId: string): Promise<boolean> {
  const docRef = doc(db, USERS_COLLECTION, userId, 'favorites', unlockableId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists();
}

// Real-time listeners
export function subscribeToUnlockables(callback: (unlockables: Unlockable[]) => void): () => void {
  const colRef = collection(db, UNLOCKABLES_COLLECTION);
  const q = query(colRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const unlockables = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Unlockable[];
    callback(unlockables);
  });
}

export function subscribeToUserUnlockables(
  userId: string,
  callback: (unlockables: UserUnlockable[]) => void
): () => void {
  const colRef = collection(db, USERS_COLLECTION, userId, 'unlockables');
  
  return onSnapshot(colRef, (snapshot) => {
    const unlockables = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      unlockableId: doc.id,
      unlockedAt: doc.data().unlockedAt?.toDate(),
    })) as UserUnlockable[];
    callback(unlockables);
  });
}

export function subscribeToUserFavorites(
  userId: string,
  callback: (favorites: UserFavorite[]) => void
): () => void {
  const colRef = collection(db, USERS_COLLECTION, userId, 'favorites');
  
  return onSnapshot(colRef, (snapshot) => {
    const favorites = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      unlockableId: doc.id,
      addedAt: doc.data().addedAt?.toDate() || new Date(),
    })) as UserFavorite[];
    // Sort in memory instead of requiring Firestore index
    favorites.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
    callback(favorites);
  });
}

// Archive Unlockable (soft delete)
export async function archiveUnlockable(id: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  await updateDoc(docRef, { archived: true });
}

export async function unarchiveUnlockable(id: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  await updateDoc(docRef, { archived: false });
}

// Admin: Get all users with pagination
export async function getUsersPaginated(
  pageSize: number = 20,
  lastDoc?: any
): Promise<{ users: User[]; lastDoc: any }> {
  const colRef = collection(db, USERS_COLLECTION);
  let q_query;
  
  if (lastDoc) {
    q_query = query(colRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
  } else {
    q_query = query(colRef, orderBy('createdAt', 'desc'), limit(pageSize));
  }
  
  const snapshot = await getDocs(q_query);
  const users = snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  })) as User[];
  
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return { users, lastDoc: newLastDoc };
}

export async function searchUsers(searchTerm: string): Promise<User[]> {
  const colRef = collection(db, USERS_COLLECTION);
  // Note: Firestore doesn't support full-text search natively
  // This is a basic implementation - consider using Algolia for production
  const snapshot = await getDocs(colRef);
  const users = snapshot.docs
    .map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }) as User)
    .filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
  return users;
}

export async function updateUserRoleById(userId: string, role: 'user' | 'admin'): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, { role });
}

// Settings Operations
export async function getSettings(): Promise<AppSettings> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'app');
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) {
    // Return defaults
    return {
      id: 'app',
      adWatchThreshold: 5,
      primaryAdType: 'direct_link',
      monetagPreloadEnabled: true,
      monetagTimeout: 5,
      monetagInApp: {
        enabled: false,
        frequency: 3,
        capping: 0.5,
        interval: 60,
        timeout: 10,
        everyPage: false,
      },
      maintenanceMode: false,
      maintenanceAllowAdmins: true,
      languageSettings: DEFAULT_LANGUAGE_SETTINGS,
      updatedAt: new Date(),
    };
  }
  
  const data = snapshot.data();
  
  // Backward compatibility: migrate adsterraUrl to directLinkUrl
  const directLinkUrl = data.directLinkUrl || data.adsterraUrl || undefined;
  
  // Backward compatibility: default primaryAdType to 'direct_link' if not set
  const primaryAdType = data.primaryAdType || 'direct_link';
  
  return {
    ...data,
    id: snapshot.id,
    primaryAdType,
    directLinkUrl,
    maintenanceMode: data.maintenanceMode ?? false,
    maintenanceAllowAdmins: data.maintenanceAllowAdmins ?? true,
    languageSettings: data.languageSettings ?? DEFAULT_LANGUAGE_SETTINGS,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as AppSettings;
}

export async function updateSettings(settings: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'app');
  
  // Deep clean: recursively remove undefined values from nested objects
  // Note: null is preserved (used to clear fields), only undefined is removed
  function cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined) continue;  // Skip undefined, but keep null
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        const cleanedNested = cleanObject(value as Record<string, unknown>);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;  // Keep null, strings, numbers, booleans, arrays, dates
      }
    }
    return cleaned;
  }
  
  const cleanSettings = cleanObject(settings as Record<string, unknown>);
  
  await setDoc(docRef, {
    ...cleanSettings,
    updatedAt: Timestamp.now(),
  }, { merge: true });
}

// Admin Stats
export async function getAdminStats(): Promise<AdminStats> {
  // Get counts from collections
  const usersCol = collection(db, USERS_COLLECTION);
  const unlockablesCol = collection(db, UNLOCKABLES_COLLECTION);
  const userUnlockablesGroup = collectionGroup(db, 'unlockables');
  
  const [usersCount, unlockablesSnapshot, userUnlockablesSnapshot] = await Promise.all([
    getCountFromServer(usersCol),
    getDocs(unlockablesCol),
    getDocs(userUnlockablesGroup),
  ]);
  
  const unlockables = unlockablesSnapshot.docs.map(d => d.data());
  const userUnlockables = userUnlockablesSnapshot.docs.map(d => d.data());
  
  const activeUnlockables = unlockables.filter(u => !u.archived).length;
  const archivedUnlockables = unlockables.filter(u => u.archived).length;
  const totalAdsWatched = userUnlockables.reduce((sum, u) => sum + (u.adsWatched || 0), 0);
  const totalUnlocked = userUnlockables.filter(u => u.unlocked).length;
  
  // Count admins
  const adminsQuery = query(usersCol, where('role', '==', 'admin'));
  const adminsSnapshot = await getDocs(adminsQuery);
  
  return {
    totalUsers: usersCount.data().count,
    totalUnlockables: unlockables.length,
    activeUnlockables,
    archivedUnlockables,
    totalAdsWatched,
    totalUnlocked,
    adminCount: adminsSnapshot.size,
  };
}

// Subscribe to settings
export function subscribeToSettings(callback: (settings: AppSettings) => void): () => void {
  const docRef = doc(db, SETTINGS_COLLECTION, 'app');
  
  return onSnapshot(docRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback({
        id: 'app',
        adWatchThreshold: 5,
        primaryAdType: 'direct_link',
        monetagPreloadEnabled: true,
        monetagTimeout: 5,
        monetagInApp: {
          enabled: false,
          frequency: 3,
          capping: 0.5,
          interval: 60,
          timeout: 10,
          everyPage: false,
        },
        maintenanceMode: false,
        maintenanceAllowAdmins: true,
        languageSettings: DEFAULT_LANGUAGE_SETTINGS,
        updatedAt: new Date(),
      });
      return;
    }
    
    const data = snapshot.data();
    
    // Backward compatibility: migrate adsterraUrl to directLinkUrl
    const directLinkUrl = data.directLinkUrl || data.adsterraUrl || undefined;
    const primaryAdType = data.primaryAdType || 'direct_link';
    
    callback({
      ...data,
      id: snapshot.id,
      primaryAdType,
      directLinkUrl,
      maintenanceMode: data.maintenanceMode ?? false,
      maintenanceAllowAdmins: data.maintenanceAllowAdmins ?? true,
      languageSettings: data.languageSettings ?? DEFAULT_LANGUAGE_SETTINGS,
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AppSettings);
  });
}
