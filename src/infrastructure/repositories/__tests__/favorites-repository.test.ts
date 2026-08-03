import type { Favorite } from '@/domain';

import {
  createAsyncStorageFavoritesRepository,
  FAVORITES_STORAGE_KEY,
  sanitizePersistedFavorites,
  type FavoritesStorage,
} from '../async-storage-favorites-repository';
import { createInMemoryFavoritesRepository } from '../in-memory-favorites-repository';

function createMemoryFavoritesStorage(): FavoritesStorage & {
  store: Map<string, string>;
} {
  const store = new Map<string, string>();
  return {
    store,
    getItem: async (key) => store.get(key) ?? null,
    setItem: async (key, value) => {
      store.set(key, value);
    },
  };
}

function favorite(overrides: Partial<Favorite> = {}): Favorite {
  return {
    id: '1',
    source: 'github',
    name: 'repo',
    fullName: 'org/repo',
    ownerName: 'org',
    stars: 1,
    favoritedAt: 1000,
    ...overrides,
  };
}

describe('sanitizePersistedFavorites', () => {
  it('WHEN root is missing or not an object THEN it returns empty items', () => {
    expect(sanitizePersistedFavorites(undefined)).toEqual({ items: [] });
    expect(sanitizePersistedFavorites(null)).toEqual({ items: [] });
    expect(sanitizePersistedFavorites('corrupt')).toEqual({ items: [] });
    expect(sanitizePersistedFavorites(42)).toEqual({ items: [] });
  });

  it('WHEN root has no items array THEN it returns empty items', () => {
    expect(sanitizePersistedFavorites({})).toEqual({ items: [] });
    expect(sanitizePersistedFavorites({ items: 'nope' })).toEqual({ items: [] });
  });

  it('WHEN items mix valid and invalid entries THEN invalid entries are dropped', () => {
    const good = favorite({ id: 'ok' });
    const result = sanitizePersistedFavorites({
      items: [good, { id: 1 }, null, { id: 'x', source: 'nope' }, { ...good, stars: 'many' }],
    });
    expect(result).toEqual({ items: [good] });
  });

  it('WHEN optional fields are omitted THEN the entry is still kept', () => {
    const minimal = favorite({ id: 'm' });
    expect(sanitizePersistedFavorites({ items: [minimal] })).toEqual({ items: [minimal] });
  });
});

describe('createAsyncStorageFavoritesRepository', () => {
  it('persists upserts under searchrepos:favorites as { items }', async () => {
    const memory = createMemoryFavoritesStorage();
    const repository = createAsyncStorageFavoritesRepository({ storage: memory });

    await repository.upsert(favorite({ id: '42', favoritedAt: 50 }));

    const raw = await memory.getItem(FAVORITES_STORAGE_KEY);
    expect(JSON.parse(String(raw))).toEqual({
      items: [expect.objectContaining({ id: '42', source: 'github' })],
    });
    await expect(repository.exists('github', '42')).resolves.toBe(true);
  });

  it('WHEN AsyncStorage payload is corrupt THEN listAll returns empty', async () => {
    const memory = createMemoryFavoritesStorage();
    await memory.setItem(FAVORITES_STORAGE_KEY, '{not-json');
    const repository = createAsyncStorageFavoritesRepository({ storage: memory });

    await expect(repository.listAll()).resolves.toEqual([]);
  });

  it('WHEN remounting THEN snapshots restore without network', async () => {
    const memory = createMemoryFavoritesStorage();
    const first = createAsyncStorageFavoritesRepository({ storage: memory });
    await first.upsert(favorite({ id: 'gh', source: 'github' }));
    await first.upsert(favorite({ id: 'gl', source: 'gitlab' }));

    const second = createAsyncStorageFavoritesRepository({ storage: memory });
    const items = await second.listAll();
    expect(items).toHaveLength(2);
    await expect(second.exists('github', 'gh')).resolves.toBe(true);
    await expect(second.exists('gitlab', 'gl')).resolves.toBe(true);
  });

  it('remove deletes only the matching (source, id)', async () => {
    const memory = createMemoryFavoritesStorage();
    const repository = createAsyncStorageFavoritesRepository({ storage: memory });
    await repository.upsert(favorite({ id: 'a', source: 'github' }));
    await repository.upsert(favorite({ id: 'a', source: 'gitlab' }));
    await repository.remove('github', 'a');

    await expect(repository.exists('github', 'a')).resolves.toBe(false);
    await expect(repository.exists('gitlab', 'a')).resolves.toBe(true);
  });
});

describe('createInMemoryFavoritesRepository', () => {
  it('seeds and mutates in memory', async () => {
    const repository = createInMemoryFavoritesRepository([favorite({ id: 'seed' })]);
    await expect(repository.exists('github', 'seed')).resolves.toBe(true);
    await repository.remove('github', 'seed');
    await expect(repository.listAll()).resolves.toEqual([]);
  });
});
