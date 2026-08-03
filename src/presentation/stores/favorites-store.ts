import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DataSource } from '@/application';

import { sanitizePersistedFavorites, type FavoriteSnapshot } from './favorite-snapshot';

export const FAVORITES_STORAGE_KEY = 'searchrepos:favorites';

export type FavoritesState = {
  items: FavoriteSnapshot[];
  /** True after persist rehydrate finishes (success or storage error). Not persisted. */
  hasHydrated: boolean;
  isFavorite: (dataSource: DataSource, id: string) => boolean;
  toggleFavorite: (snapshot: FavoriteSnapshot) => void;
  removeFavorite: (dataSource: DataSource, id: string) => void;
  listBySource: (dataSource: DataSource) => FavoriteSnapshot[];
  setHasHydrated: (hasHydrated: boolean) => void;
};

function sameFavorite(a: FavoriteSnapshot, dataSource: DataSource, id: string): boolean {
  return a.dataSource === dataSource && a.id === id;
}

export type CreateFavoritesStoreOptions = {
  storage?: StateStorage;
};

export function createFavoritesStore(options: CreateFavoritesStoreOptions = {}) {
  let markHydrated: () => void = () => {};

  const store = create<FavoritesState>()(
    persist(
      (set, get) => ({
        items: [],
        hasHydrated: false,
        isFavorite: (dataSource, id) =>
          get().items.some((item) => sameFavorite(item, dataSource, id)),
        toggleFavorite: (snapshot) => {
          const { dataSource, id } = snapshot;
          if (get().isFavorite(dataSource, id)) {
            set((state) => ({
              items: state.items.filter((item) => !sameFavorite(item, dataSource, id)),
            }));
            return;
          }
          // Idempotent upsert: drop any same-key entry, then append refreshed snapshot.
          set((state) => ({
            items: [...state.items.filter((item) => !sameFavorite(item, dataSource, id)), snapshot],
          }));
        },
        removeFavorite: (dataSource, id) => {
          set((state) => ({
            items: state.items.filter((item) => !sameFavorite(item, dataSource, id)),
          }));
        },
        listBySource: (dataSource) =>
          get()
            .items.filter((item) => item.dataSource === dataSource)
            .slice()
            .sort((a, b) => b.favoritedAt - a.favoritedAt),
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      }),
      {
        name: FAVORITES_STORAGE_KEY,
        storage: createJSONStorage(() => options.storage ?? AsyncStorage),
        partialize: (state) => ({ items: state.items }),
        merge: (persistedState, currentState) => {
          const sanitized = sanitizePersistedFavorites(persistedState);
          return {
            ...currentState,
            items: sanitized.items,
          };
        },
        onRehydrateStorage: () => () => {
          markHydrated();
        },
      },
    ),
  );

  markHydrated = () => {
    store.setState({ hasHydrated: true });
  };

  return store;
}

export const useFavoritesStore = createFavoritesStore();
