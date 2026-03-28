import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  onSnapshot,
  addDoc,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './config';
import type { User, Unlockable, UserUnlockable, UserFavorite, AppSettings, AdminStats } from '@/types';

// Users Collection
const USERS_COLLECTION = 'users';
const UNLOCKABLES_COLLECTION = 'unlockables';
const USER_UNLOCKABLES_COLLECTION = 'user_unlockables';
const USER_FAVORITES_COLLECTION = 'user_favorites';
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
  const colRef = collection(db, USERS_COLLECTION);
  const q = query(colRef, where('telegramId', '==', telegramId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
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
  
  const docRef = await addDoc(colRef, {
    ...unlockable,
    createdAt: now,
  });
  
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
  await updateDoc(docRef, data);
}

export async function deleteUnlockable(id: string): Promise<void> {
  const docRef = doc(db, UNLOCKABLES_COLLECTION, id);
  await deleteDoc(docRef);
}

// User Unlockables Operations
export async function getUserUnlockable(userId: string, unlockableId: string): Promise<UserUnlockable | null> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_UNLOCKABLES_COLLECTION, docId);
  const snapshot = await getDoc(docRef);
  
  if (!snapshot.exists()) return null;
  
  return {
    ...snapshot.data(),
    id: snapshot.id,
    unlockedAt: snapshot.data().unlockedAt?.toDate(),
  } as UserUnlockable;
}

export async function getUserUnlockables(userId: string): Promise<UserUnlockable[]> {
  const colRef = collection(db, USER_UNLOCKABLES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    unlockedAt: doc.data().unlockedAt?.toDate(),
  })) as UserUnlockable[];
}

export async function incrementAdsWatched(userId: string, unlockableId: string): Promise<UserUnlockable> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_UNLOCKABLES_COLLECTION, docId);
  const existing = await getDoc(docRef);
  
  if (!existing.exists()) {
    const newData = {
      userId,
      unlockableId,
      adsWatched: 1,
      unlocked: false,
    };
    await setDoc(docRef, newData);
    return { id: docId, ...newData } as UserUnlockable;
  }
  
  const currentData = existing.data();
  const newAdsWatched = (currentData.adsWatched || 0) + 1;
  
  await updateDoc(docRef, {
    adsWatched: newAdsWatched,
  });
  
  return {
    ...currentData,
    id: docId,
    adsWatched: newAdsWatched,
  } as UserUnlockable;
}

export async function unlockItem(userId: string, unlockableId: string): Promise<void> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_UNLOCKABLES_COLLECTION, docId);
  
  await updateDoc(docRef, {
    unlocked: true,
    unlockedAt: Timestamp.now(),
  });
}

// User Favorites Operations
export async function addFavorite(userId: string, unlockableId: string): Promise<UserFavorite> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_FAVORITES_COLLECTION, docId);
  const now = Timestamp.now();
  
  await setDoc(docRef, {
    userId,
    unlockableId,
    addedAt: now,
  });
  
  return {
    id: docId,
    userId,
    unlockableId,
    addedAt: now.toDate(),
  };
}

export async function removeFavorite(userId: string, unlockableId: string): Promise<void> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_FAVORITES_COLLECTION, docId);
  await deleteDoc(docRef);
}

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const colRef = collection(db, USER_FAVORITES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId), orderBy('addedAt', 'desc'));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    addedAt: doc.data().addedAt?.toDate() || new Date(),
  })) as UserFavorite[];
}

export async function isFavorite(userId: string, unlockableId: string): Promise<boolean> {
  const docId = `${userId}_${unlockableId}`;
  const docRef = doc(db, USER_FAVORITES_COLLECTION, docId);
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
  const colRef = collection(db, USER_UNLOCKABLES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const unlockables = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      unlockedAt: doc.data().unlockedAt?.toDate(),
    })) as UserUnlockable[];
    callback(unlockables);
  });
}

export function subscribeToUserFavorites(
  userId: string,
  callback: (favorites: UserFavorite[]) => void
): () => void {
  const colRef = collection(db, USER_FAVORITES_COLLECTION);
  const q = query(colRef, where('userId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const favorites = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
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
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as AppSettings;
}

export async function updateSettings(settings: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, 'app');
  // Filter out undefined values to prevent Firebase error
  const cleanSettings = Object.fromEntries(
    Object.entries(settings).filter(([_, v]) => v !== undefined)
  );
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
  const userUnlockablesCol = collection(db, USER_UNLOCKABLES_COLLECTION);
  
  const [usersCount, unlockablesSnapshot, userUnlockablesSnapshot] = await Promise.all([
    getCountFromServer(usersCol),
    getDocs(unlockablesCol),
    getDocs(userUnlockablesCol),
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
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AppSettings);
  });
}
