import { create } from 'zustand';

import type { Favorite } from '@/domain';

export type FavoritesState = {
  items: Favorite[];
  /** True after hydrate finishes (success or error). */
  hasHydrated: boolean;
  setItems: (items: Favorite[]) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  isFavorite: (source: string, id: string) => boolean;
  listBySource: (source: string) => Favorite[];
  /** Load once / refresh from a use-case loader. On error → items [] + hasHydrated true. */
  hydrate: (loader: () => Promise<Favorite[]>) => Promise<void>;
};

export function createFavoritesStore() {
  return create<FavoritesState>((set, get) => ({
    items: [],
    hasHydrated: false,
    setItems: (items) => set({ items }),
    setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    isFavorite: (source, id) =>
      get().items.some((item) => item.source === source && item.id === id),
    listBySource: (source) =>
      get()
        .items.filter((item) => item.source === source)
        .slice()
        .sort((a, b) => b.favoritedAt - a.favoritedAt),
    hydrate: async (loader) => {
      try {
        const items = await loader();
        set({ items, hasHydrated: true });
      } catch {
        set({ items: [], hasHydrated: true });
      }
    },
  }));
}

export const useFavoritesStore = createFavoritesStore();
