import type { Favorite, FavoritesRepository } from '@/domain';

export type ToggleFavoriteResult = {
  favorited: boolean;
};

export type ToggleFavorite = (favorite: Favorite) => Promise<ToggleFavoriteResult>;

export function createToggleFavorite(repository: FavoritesRepository): ToggleFavorite {
  return async (favorite) => {
    const already = await repository.exists(favorite.source, favorite.id);
    if (already) {
      await repository.remove(favorite.source, favorite.id);
      return { favorited: false };
    }
    await repository.upsert(favorite);
    return { favorited: true };
  };
}
