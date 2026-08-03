import { createMemoryStorage } from '@/test/memory-storage';

import type { FavoriteSnapshot } from '../favorite-snapshot';
import {
  createFavoritesStore,
  FAVORITES_STORAGE_KEY,
  type FavoritesState,
} from '../favorites-store';
import { createSessionPreferencesStore } from '../session-preferences-store';

function snapshot(overrides: Partial<FavoriteSnapshot> = {}): FavoriteSnapshot {
  return {
    id: '1',
    dataSource: 'github',
    name: 'repo',
    fullName: 'org/repo',
    ownerName: 'org',
    stars: 1,
    favoritedAt: 1000,
    ...overrides,
  };
}

async function waitHydrated(store: {
  getState: () => FavoritesState;
  persist: { rehydrate: () => Promise<void> };
}) {
  await store.persist.rehydrate();
  expect(store.getState().hasHydrated).toBe(true);
}

describe('favorites store (FAV-02, FAV-03, FAV-05, FAV-07)', () => {
  it('WHEN store is created THEN items are empty and hasHydrated is false until rehydrate', () => {
    const store = createFavoritesStore({ storage: createMemoryStorage() });
    expect(store.getState().items).toEqual([]);
    expect(store.getState().hasHydrated).toBe(false);
  });

  it('WHEN toggleFavorite adds a new snapshot THEN it persists under searchrepos:favorites', async () => {
    const memory = createMemoryStorage();
    const store = createFavoritesStore({ storage: memory });
    await waitHydrated(store);

    store.getState().toggleFavorite(snapshot({ id: '42', favoritedAt: 50 }));
    await Promise.resolve();

    expect(store.getState().isFavorite('github', '42')).toBe(true);
    expect(store.getState().items).toHaveLength(1);

    const raw = await memory.getItem(FAVORITES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(String(raw)) as { state: { items: FavoriteSnapshot[] } };
    expect(parsed.state.items).toHaveLength(1);
    expect(parsed.state.items[0]?.id).toBe('42');
    expect(parsed.state).not.toHaveProperty('hasHydrated');
  });

  it('WHEN toggleFavorite on an existing favorite THEN it removes that entry', async () => {
    const store = createFavoritesStore({ storage: createMemoryStorage() });
    await waitHydrated(store);

    const item = snapshot({ id: '7' });
    store.getState().toggleFavorite(item);
    expect(store.getState().isFavorite('github', '7')).toBe(true);

    store.getState().toggleFavorite(item);
    expect(store.getState().isFavorite('github', '7')).toBe(false);
    expect(store.getState().items).toEqual([]);
  });

  it('WHEN the same (dataSource, id) is favorited again after remove THEN a single refreshed entry remains', async () => {
    const store = createFavoritesStore({ storage: createMemoryStorage() });
    await waitHydrated(store);

    store.getState().toggleFavorite(snapshot({ id: '1', stars: 1, favoritedAt: 10 }));
    store.getState().removeFavorite('github', '1');
    store.getState().toggleFavorite(snapshot({ id: '1', stars: 99, favoritedAt: 20 }));

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0]?.stars).toBe(99);
    expect(store.getState().items[0]?.favoritedAt).toBe(20);
  });

  it('WHEN removeFavorite is called THEN that (dataSource, id) is removed and persisted', async () => {
    const memory = createMemoryStorage();
    const store = createFavoritesStore({ storage: memory });
    await waitHydrated(store);

    store.getState().toggleFavorite(snapshot({ id: 'a', dataSource: 'github' }));
    store.getState().toggleFavorite(snapshot({ id: 'a', dataSource: 'gitlab' }));
    store.getState().removeFavorite('github', 'a');
    await Promise.resolve();

    expect(store.getState().isFavorite('github', 'a')).toBe(false);
    expect(store.getState().isFavorite('gitlab', 'a')).toBe(true);

    const remount = createFavoritesStore({ storage: memory });
    await remount.persist.rehydrate();
    expect(remount.getState().isFavorite('github', 'a')).toBe(false);
    expect(remount.getState().isFavorite('gitlab', 'a')).toBe(true);
  });

  it('WHEN listBySource is called THEN it returns only that source sorted by favoritedAt desc', async () => {
    const store = createFavoritesStore({ storage: createMemoryStorage() });
    await waitHydrated(store);

    store.getState().toggleFavorite(snapshot({ id: 'g1', dataSource: 'github', favoritedAt: 10 }));
    store.getState().toggleFavorite(snapshot({ id: 'gl1', dataSource: 'gitlab', favoritedAt: 99 }));
    store.getState().toggleFavorite(snapshot({ id: 'g2', dataSource: 'github', favoritedAt: 30 }));
    store.getState().toggleFavorite(snapshot({ id: 'g3', dataSource: 'github', favoritedAt: 20 }));

    expect(
      store
        .getState()
        .listBySource('github')
        .map((i) => i.id),
    ).toEqual(['g2', 'g3', 'g1']);
    expect(
      store
        .getState()
        .listBySource('gitlab')
        .map((i) => i.id),
    ).toEqual(['gl1']);
  });

  it('WHEN AsyncStorage payload is corrupt THEN items are empty and hasHydrated is true', async () => {
    const memory = createMemoryStorage();
    await memory.setItem(FAVORITES_STORAGE_KEY, '{not-json');

    const store = createFavoritesStore({ storage: memory });
    await store.persist.rehydrate();

    expect(store.getState().items).toEqual([]);
    expect(store.getState().hasHydrated).toBe(true);
  });

  it('WHEN persisted items include invalid entries THEN they are dropped and valid ones kept', async () => {
    const memory = createMemoryStorage();
    const good = snapshot({ id: 'ok', favoritedAt: 5 });
    await memory.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({
        state: { items: [good, { id: 1 }, null, { id: 'x', dataSource: 'nope' }] },
        version: 0,
      }),
    );

    const store = createFavoritesStore({ storage: memory });
    await store.persist.rehydrate();

    expect(store.getState().items).toEqual([good]);
    expect(store.getState().hasHydrated).toBe(true);
  });

  it('WHEN cold-start remounts THEN snapshots restore without network', async () => {
    const memory = createMemoryStorage();
    const first = createFavoritesStore({ storage: memory });
    await waitHydrated(first);

    first.getState().toggleFavorite(snapshot({ id: 'gh', dataSource: 'github', favoritedAt: 1 }));
    first.getState().toggleFavorite(snapshot({ id: 'gl', dataSource: 'gitlab', favoritedAt: 2 }));
    await Promise.resolve();

    const second = createFavoritesStore({ storage: memory });
    await second.persist.rehydrate();

    expect(second.getState().listBySource('github')).toHaveLength(1);
    expect(second.getState().listBySource('gitlab')).toHaveLength(1);
    expect(second.getState().isFavorite('github', 'gh')).toBe(true);
    expect(second.getState().hasHydrated).toBe(true);
  });

  it('WHEN session preferences reset THEN favorites are not cleared', async () => {
    const favorites = createFavoritesStore({ storage: createMemoryStorage() });
    const session = createSessionPreferencesStore({ storage: createMemoryStorage() });
    await waitHydrated(favorites);

    favorites.getState().toggleFavorite(snapshot({ id: 'keep' }));
    expect(favorites.getState().items).toHaveLength(1);

    session.getState().reset();
    await Promise.resolve();

    expect(favorites.getState().isFavorite('github', 'keep')).toBe(true);
    expect(favorites.getState().items).toHaveLength(1);
  });
});
