import type { Favorite, FavoritesRepository, Repo } from '@/domain';

import { createFavoriteFromRepo } from '../create-favorite-from-repo';
import { createIsFavorite } from '../is-favorite';
import { createListFavorites } from '../list-favorites';
import { createListFavoritesBySource } from '../list-favorites-by-source';
import { createRemoveFavorite } from '../remove-favorite';
import { createToggleFavorite } from '../toggle-favorite';

function createFakeFavoritesRepository(initial: Favorite[] = []): FavoritesRepository {
  const items = [...initial];

  return {
    async listAll() {
      return [...items];
    },
    async upsert(favorite) {
      const index = items.findIndex(
        (item) => item.source === favorite.source && item.id === favorite.id,
      );
      if (index >= 0) {
        items[index] = favorite;
        return;
      }
      items.push(favorite);
    },
    async remove(source, id) {
      const index = items.findIndex((item) => item.source === source && item.id === id);
      if (index >= 0) {
        items.splice(index, 1);
      }
    },
    async exists(source, id) {
      return items.some((item) => item.source === source && item.id === id);
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

const sampleRepo: Repo = {
  id: '99',
  name: 'demo',
  fullName: 'org/demo',
  description: 'Hello',
  stars: 5,
  forks: 2,
  watchers: 3,
  language: 'Go',
  ownerName: 'org',
  ownerAvatarUrl: 'https://example.com/o.png',
  htmlUrl: 'https://github.com/org/demo',
};

describe('createFavoriteFromRepo', () => {
  it('maps DataSource to source and copies repo fields with favoritedAt', () => {
    const now = 1_711_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    expect(createFavoriteFromRepo(sampleRepo, 'gitlab')).toEqual({
      id: '99',
      source: 'gitlab',
      name: 'demo',
      fullName: 'org/demo',
      ownerName: 'org',
      ownerAvatarUrl: 'https://example.com/o.png',
      stars: 5,
      description: 'Hello',
      language: 'Go',
      favoritedAt: now,
    });

    jest.restoreAllMocks();
  });

  it('omits optional fields when absent on repo', () => {
    jest.spyOn(Date, 'now').mockReturnValue(100);
    const sparse: Repo = {
      id: '1',
      name: 'n',
      fullName: 'o/n',
      stars: 0,
      forks: 0,
      watchers: 0,
      ownerName: 'o',
      htmlUrl: 'https://example.com',
    };

    const result = createFavoriteFromRepo(sparse, 'github');
    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('language');
    expect(result).not.toHaveProperty('ownerAvatarUrl');
    jest.restoreAllMocks();
  });
});

describe('favorites use cases', () => {
  it('listFavorites sorts by favoritedAt desc', async () => {
    const listFavorites = createListFavorites(
      createFakeFavoritesRepository([
        favorite({ id: 'a', favoritedAt: 10 }),
        favorite({ id: 'b', favoritedAt: 30 }),
        favorite({ id: 'c', favoritedAt: 20 }),
      ]),
    );

    const items = await listFavorites();
    expect(items.map((item) => item.id)).toEqual(['b', 'c', 'a']);
  });

  it('listFavoritesBySource filters by source and sorts', async () => {
    const listBySource = createListFavoritesBySource(
      createFakeFavoritesRepository([
        favorite({ id: 'g1', source: 'github', favoritedAt: 10 }),
        favorite({ id: 'gl1', source: 'gitlab', favoritedAt: 99 }),
        favorite({ id: 'g2', source: 'github', favoritedAt: 30 }),
      ]),
    );

    await expect(listBySource({ source: 'github' })).resolves.toMatchObject([
      { id: 'g2' },
      { id: 'g1' },
    ]);
    await expect(listBySource({ source: 'gitlab' })).resolves.toMatchObject([{ id: 'gl1' }]);
  });

  it('toggleFavorite upserts when missing and removes when present', async () => {
    const repository = createFakeFavoritesRepository();
    const toggle = createToggleFavorite(repository);
    const item = favorite({ id: '42', favoritedAt: 50 });

    await expect(toggle(item)).resolves.toEqual({ favorited: true });
    await expect(repository.exists('github', '42')).resolves.toBe(true);

    await expect(toggle(item)).resolves.toEqual({ favorited: false });
    await expect(repository.exists('github', '42')).resolves.toBe(false);
  });

  it('removeFavorite deletes by source and id', async () => {
    const repository = createFakeFavoritesRepository([
      favorite({ id: 'a', source: 'github' }),
      favorite({ id: 'a', source: 'gitlab' }),
    ]);
    const removeFavorite = createRemoveFavorite(repository);

    await removeFavorite({ source: 'github', id: 'a' });

    await expect(repository.exists('github', 'a')).resolves.toBe(false);
    await expect(repository.exists('gitlab', 'a')).resolves.toBe(true);
  });

  it('isFavorite delegates to repository.exists', async () => {
    const isFavorite = createIsFavorite(
      createFakeFavoritesRepository([favorite({ id: 'keep', source: 'github' })]),
    );

    await expect(isFavorite({ source: 'github', id: 'keep' })).resolves.toBe(true);
    await expect(isFavorite({ source: 'gitlab', id: 'keep' })).resolves.toBe(false);
  });
});
