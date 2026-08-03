import type { Favorite, FavoritesRepository } from '@/domain';

export type ListFavorites = () => Promise<Favorite[]>;

function sortByFavoritedAtDesc(a: Favorite, b: Favorite): number {
  return b.favoritedAt - a.favoritedAt;
}

export function createListFavorites(repository: FavoritesRepository): ListFavorites {
  return async () => {
    const items = await repository.listAll();
    return items.slice().sort(sortByFavoritedAtDesc);
  };
}
