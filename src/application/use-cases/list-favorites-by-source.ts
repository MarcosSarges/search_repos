import type { Favorite, FavoritesRepository } from '@/domain';

import type { DataSource } from '../types/data-source';

export type ListFavoritesBySourceInput = {
  source: DataSource;
};

export type ListFavoritesBySource = (input: ListFavoritesBySourceInput) => Promise<Favorite[]>;

function sortByFavoritedAtDesc(a: Favorite, b: Favorite): number {
  return b.favoritedAt - a.favoritedAt;
}

export function createListFavoritesBySource(
  repository: FavoritesRepository,
): ListFavoritesBySource {
  return async (input) => {
    const items = await repository.listAll();
    return items
      .filter((item) => item.source === input.source)
      .slice()
      .sort(sortByFavoritedAtDesc);
  };
}
