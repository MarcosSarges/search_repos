import type { Favorite } from '../entities/favorite';

/**
 * Local favorites write-model port (offline snapshots).
 *
 * Implementations SHALL persist opaque `(source, id)` identity without
 * coupling domain to application `DataSource`.
 */
export type FavoritesRepository = {
  listAll: () => Promise<Favorite[]>;
  upsert: (favorite: Favorite) => Promise<void>;
  remove: (source: string, id: string) => Promise<void>;
  exists: (source: string, id: string) => Promise<boolean>;
};
