import type { Favorite } from '@/domain';
import { createSessionPreferencesStore } from '../session-preferences-store';
import { createFavoritesStore, type FavoritesState } from '../favorites-store';

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

describe('favorites store (thin cache)', () => {
  it('WHEN store is created THEN items are empty and hasHydrated is false', () => {
    const store = createFavoritesStore();
    expect(store.getState().items).toEqual([]);
    expect(store.getState().hasHydrated).toBe(false);
  });

  it('WHEN hydrate succeeds THEN items are set and hasHydrated is true', async () => {
    const store = createFavoritesStore();
    const items = [favorite({ id: 'a' }), favorite({ id: 'b', source: 'gitlab' })];

    await store.getState().hydrate(async () => items);

    expect(store.getState().items).toEqual(items);
    expect(store.getState().hasHydrated).toBe(true);
    expect(store.getState().isFavorite('github', 'a')).toBe(true);
    expect(store.getState().isFavorite('gitlab', 'b')).toBe(true);
  });

  it('WHEN hydrate fails THEN items are empty and hasHydrated is true', async () => {
    const store = createFavoritesStore();

    await store.getState().hydrate(async () => {
      throw new Error('storage boom');
    });

    expect(store.getState().items).toEqual([]);
    expect(store.getState().hasHydrated).toBe(true);
  });

  it('WHEN listBySource is called THEN it returns only that source sorted by favoritedAt desc', () => {
    const store = createFavoritesStore();
    store
      .getState()
      .setItems([
        favorite({ id: 'g1', source: 'github', favoritedAt: 10 }),
        favorite({ id: 'gl1', source: 'gitlab', favoritedAt: 99 }),
        favorite({ id: 'g2', source: 'github', favoritedAt: 30 }),
        favorite({ id: 'g3', source: 'github', favoritedAt: 20 }),
      ]);
    store.getState().setHasHydrated(true);

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

  it('WHEN session preferences reset THEN favorites cache is not cleared', () => {
    const favorites = createFavoritesStore();
    const session = createSessionPreferencesStore();
    favorites.getState().setItems([favorite({ id: 'keep' })]);
    favorites.getState().setHasHydrated(true);

    session.getState().reset();

    expect(favorites.getState().isFavorite('github', 'keep')).toBe(true);
    expect(favorites.getState().items).toHaveLength(1);
  });

  it('WHEN setItems is called THEN selectors reflect cache without persist middleware', () => {
    const store = createFavoritesStore();
    const state: FavoritesState = store.getState();
    expect(state).not.toHaveProperty('persist');
    expect(typeof state.hydrate).toBe('function');
    expect(typeof state.toggleFavorite).toBe('undefined');
  });
});
