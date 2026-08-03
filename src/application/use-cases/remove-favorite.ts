import type { FavoritesRepository } from '@/domain';

import type { DataSource } from '../types/data-source';

export type RemoveFavoriteInput = {
  source: DataSource;
  id: string;
};

export type RemoveFavorite = (input: RemoveFavoriteInput) => Promise<void>;

export function createRemoveFavorite(repository: FavoritesRepository): RemoveFavorite {
  return async (input) => {
    await repository.remove(input.source, input.id);
  };
}
