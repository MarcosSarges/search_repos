import type { Favorite, FavoritesRepository } from '@/domain';

export function createInMemoryFavoritesRepository(initial: Favorite[] = []): FavoritesRepository {
  const items = [...initial];

  return {
    async listAll() {
      return [...items];
    },
    async upsert(favorite) {
      const index = items.findIndex(
        (item) => item.source === favorite.source && item.id === favorite.id,
      );
      if (index >= 0) {
        items[index] = favorite;
        return;
      }
      items.push(favorite);
    },
    async remove(source, id) {
      const index = items.findIndex((item) => item.source === source && item.id === id);
      if (index >= 0) {
        items.splice(index, 1);
      }
    },
    async exists(source, id) {
      return items.some((item) => item.source === source && item.id === id);
    },
  };
}
