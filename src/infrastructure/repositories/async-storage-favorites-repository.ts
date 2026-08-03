import AsyncStorage from '@react-native-async-storage/async-storage';

import { isDataSource } from '@/application';
import type { Favorite, FavoritesRepository } from '@/domain';

export const FAVORITES_STORAGE_KEY = 'searchrepos:favorites';

export type FavoritesPersisted = {
  items: Favorite[];
};

export type FavoritesStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isFavorite(value: unknown): value is Favorite {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (!isNonEmptyString(record.id)) {
    return false;
  }
  if (!isNonEmptyString(record.source) || !isDataSource(record.source)) {
    return false;
  }
  if (typeof record.name !== 'string') {
    return false;
  }
  if (typeof record.fullName !== 'string') {
    return false;
  }
  if (typeof record.ownerName !== 'string') {
    return false;
  }
  if (typeof record.stars !== 'number' || Number.isNaN(record.stars)) {
    return false;
  }
  if (typeof record.favoritedAt !== 'number' || Number.isNaN(record.favoritedAt)) {
    return false;
  }
  if (!isOptionalString(record.ownerAvatarUrl)) {
    return false;
  }
  if (!isOptionalString(record.description)) {
    return false;
  }
  if (!isOptionalString(record.language)) {
    return false;
  }
  return true;
}

/** Corrupt root → `{ items: [] }`; invalid array entries dropped. */
export function sanitizePersistedFavorites(raw: unknown): FavoritesPersisted {
  if (!raw || typeof raw !== 'object') {
    return { items: [] };
  }
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.items)) {
    return { items: [] };
  }
  return {
    items: record.items.filter(isFavorite),
  };
}

export type CreateAsyncStorageFavoritesRepositoryOptions = {
  storage?: FavoritesStorage;
  key?: string;
};

export function createAsyncStorageFavoritesRepository(
  options: CreateAsyncStorageFavoritesRepositoryOptions = {},
): FavoritesRepository {
  const storage = options.storage ?? AsyncStorage;
  const key = options.key ?? FAVORITES_STORAGE_KEY;

  async function readItems(): Promise<Favorite[]> {
    try {
      const raw = await storage.getItem(key);
      if (raw == null) {
        return [];
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return [];
      }
      return sanitizePersistedFavorites(parsed).items;
    } catch {
      return [];
    }
  }

  async function writeItems(items: Favorite[]): Promise<void> {
    await storage.setItem(key, JSON.stringify({ items } satisfies FavoritesPersisted));
  }

  return {
    async listAll() {
      return readItems();
    },
    async upsert(favorite) {
      const items = await readItems();
      const index = items.findIndex(
        (item) => item.source === favorite.source && item.id === favorite.id,
      );
      if (index >= 0) {
        items[index] = favorite;
      } else {
        items.push(favorite);
      }
      await writeItems(items);
    },
    async remove(source, id) {
      const items = await readItems();
      await writeItems(items.filter((item) => !(item.source === source && item.id === id)));
    },
    async exists(source, id) {
      const items = await readItems();
      return items.some((item) => item.source === source && item.id === id);
    },
  };
}
