import { useCallback, useEffect } from 'react';

import type { DataSource } from '@/application';
import type { Favorite } from '@/domain';

import { useAppContainer } from './use-app-container';
import { useFavoritesStore } from '../stores/favorites-store';

export function useFavorites() {
  const { container } = useAppContainer();
  const items = useFavoritesStore((state) => state.items);
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const listBySource = useFavoritesStore((state) => state.listBySource);
  const hydrate = useFavoritesStore((state) => state.hydrate);

  const refresh = useCallback(async () => {
    await hydrate(() => container.listFavorites());
  }, [container, hydrate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(
    async (favorite: Favorite) => {
      await container.toggleFavorite(favorite);
      await refresh();
    },
    [container, refresh],
  );

  const removeFavorite = useCallback(
    async (source: DataSource, id: string) => {
      await container.removeFavorite({ source, id });
      await refresh();
    },
    [container, refresh],
  );

  return {
    items,
    hasHydrated,
    isFavorite,
    listBySource,
    toggleFavorite,
    removeFavorite,
    refresh,
  };
}
