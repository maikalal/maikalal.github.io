import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSignal, initData, miniApp } from '@tma.js/sdk-react';
import { signInAnonymously } from 'firebase/auth';
import { parseTelegramUser } from '@/firebase/auth';
import { auth } from '@/firebase/config';
import {
  getUserByTelegramId,
  subscribeToSettings,
  subscribeToUnlockables,
  subscribeToUserUnlockables,
  subscribeToUserFavorites,
  addFavorite,
  removeFavorite,
  incrementAdsWatched,
  unlockItem,
  createUser,
} from '@/firebase/firestore';
import type { User, Unlockable, UserUnlockable, UserFavorite, AppSettings } from '@/types';

interface AppContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  unlockables: Unlockable[];
  userUnlockables: UserUnlockable[];
  favorites: UserFavorite[];
  favoriteIds: Set<string>;
  unlockedIds: Set<string>;
  settings: AppSettings | null;
  isDark: boolean;
  toggleFavorite: (unlockableId: string) => Promise<void>;
  watchAd: (unlockableId: string) => Promise<void>;
  getProgress: (unlockableId: string) => { watched: number; required: number; progress: number };
  isUnlocked: (unlockableId: string) => boolean;
  isFavorite: (unlockableId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isDark = useSignal(miniApp.isDark);
  const initDataRaw = useSignal(initData.raw);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockables, setUnlockables] = useState<Unlockable[]>([]);
  const [userUnlockables, setUserUnlockables] = useState<UserUnlockable[]>([]);
  const [favorites, setFavorites] = useState<UserFavorite[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Derived state
  const favoriteIds = new Set(favorites.map(f => f.unlockableId));
  const unlockableIds = new Set(unlockables.map(u => u.id));
  // Only count unlocked items that still exist in unlockables
  const unlockedIds = new Set(
    userUnlockables
      .filter(u => u.unlocked && unlockableIds.has(u.unlockableId))
      .map(u => u.unlockableId)
  );

  // Subscribe to settings
  useEffect(() => {
    const unsubscribe = subscribeToSettings(setSettings);
    return unsubscribe;
  }, []);

  // Initialize user
  useEffect(() => {
    async function initUser() {
      try {
        setLoading(true);

        // Sign in to Firebase anonymously first
        const credential = await signInAnonymously(auth);
        const firebaseUid = credential.user.uid;

        // In development or outside Telegram, use mock user
        const isDev = import.meta.env.DEV || !initDataRaw;

        if (isDev) {
          // Try to get existing mock user
          let mockUser = await getUserByTelegramId(123456789);

          if (!mockUser) {
            // Create mock user for dev with Firebase UID
            mockUser = await createUser({
              telegramId: 123456789,
              firstName: 'Dev',
              lastName: 'User',
              username: 'devuser',
              role: 'admin',
              firebaseUid,
            });
          }
          setUser(mockUser);
          setLoading(false);
          return;
        }

        // Parse Telegram user from init data
        const telegramUser = parseTelegramUser(initDataRaw || '');

        if (!telegramUser) {
          setError('Could not get Telegram user data');
          setLoading(false);
          return;
        }

        // Get or create user in Firestore
        let existingUser = await getUserByTelegramId(telegramUser.id);

        if (!existingUser) {
          existingUser = await createUser({
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            ...(telegramUser.last_name && { lastName: telegramUser.last_name }),
            ...(telegramUser.username && { username: telegramUser.username }),
            ...(telegramUser.photo_url && { photoUrl: telegramUser.photo_url }),
            role: 'user',
            firebaseUid,
          });
        }

        setUser(existingUser);

      } catch (err) {
        console.error('Error initializing user:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setLoading(false);
      }
    }

    initUser();
  }, [initDataRaw]);

  // Subscribe to unlockables
  useEffect(() => {
    const unsubscribe = subscribeToUnlockables((data) => {
      setUnlockables(data);
    });
    return unsubscribe;
  }, []);

  // Subscribe to user unlockables
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserUnlockables(user.id, (data) => {
      setUserUnlockables(data);
    });
    return unsubscribe;
  }, [user]);

  // Subscribe to user favorites
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserFavorites(user.id, (data) => {
      setFavorites(data);
    });
    return unsubscribe;
  }, [user]);

  const toggleFavorite = useCallback(async (unlockableId: string) => {
    if (!user) return;

    if (favoriteIds.has(unlockableId)) {
      await removeFavorite(user.id, unlockableId);
      // Update local state immediately
      setFavorites(prev => prev.filter(f => f.unlockableId !== unlockableId));
    } else {
      const newFavorite = await addFavorite(user.id, unlockableId);
      // Update local state immediately
      setFavorites(prev => [...prev, newFavorite]);
    }
  }, [user, favoriteIds]);

  const watchAd = useCallback(async (unlockableId: string) => {
    if (!user) return;

    const unlockable = unlockables.find(u => u.id === unlockableId);
    if (!unlockable) return;

    const result = await incrementAdsWatched(user.id, unlockableId);

    // Check if unlocked
    if (result.adsWatched >= unlockable.adsRequired && !result.unlocked) {
      await unlockItem(user.id, unlockableId);
    }
  }, [user, unlockables]);

  const getProgress = useCallback((unlockableId: string) => {
    const unlockable = unlockables.find(u => u.id === unlockableId);
    const userUnlockable = userUnlockables.find(u => u.unlockableId === unlockableId);

    const watched = userUnlockable?.adsWatched || 0;
    const required = unlockable?.adsRequired || 1;

    return {
      watched,
      required,
      progress: Math.min(watched / required, 1),
    };
  }, [unlockables, userUnlockables]);

  const isUnlocked = useCallback((unlockableId: string) => {
    return unlockedIds.has(unlockableId);
  }, [unlockedIds]);

  const isFavorite = useCallback((unlockableId: string) => {
    return favoriteIds.has(unlockableId);
  }, [favoriteIds]);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    const updatedUser = await getUserByTelegramId(user.telegramId);
    if (updatedUser) {
      setUser(updatedUser);
    }
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        error,
        unlockables,
        userUnlockables,
        favorites,
        favoriteIds,
        unlockedIds,
        settings,
        isDark,
        toggleFavorite,
        watchAd,
        getProgress,
        isUnlocked,
        isFavorite,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
