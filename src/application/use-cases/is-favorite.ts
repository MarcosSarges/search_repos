import type { FavoritesRepository } from '@/domain';

import type { DataSource } from '../types/data-source';

export type IsFavoriteInput = {
  source: DataSource;
  id: string;
};

export type IsFavorite = (input: IsFavoriteInput) => Promise<boolean>;

export function createIsFavorite(repository: FavoritesRepository): IsFavorite {
  return async (input) => repository.exists(input.source, input.id);
}
