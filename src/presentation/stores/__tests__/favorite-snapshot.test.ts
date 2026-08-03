import type { Repo } from '@/domain';

import {
  sanitizePersistedFavorites,
  toFavoriteSnapshot,
  type FavoriteSnapshot,
} from '../favorite-snapshot';

const validSnapshot = (overrides: Partial<FavoriteSnapshot> = {}): FavoriteSnapshot => ({
  id: '42',
  dataSource: 'github',
  name: 'searchrepos',
  fullName: 'acme/searchrepos',
  ownerName: 'acme',
  ownerAvatarUrl: 'https://example.com/a.png',
  stars: 10,
  description: 'A repo',
  language: 'TypeScript',
  favoritedAt: 1_700_000_000_000,
  ...overrides,
});

describe('sanitizePersistedFavorites (FAV-02 / FAV-05)', () => {
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

  it('WHEN items contain a valid snapshot THEN it is kept', () => {
    const item = validSnapshot();
    expect(sanitizePersistedFavorites({ items: [item] })).toEqual({ items: [item] });
  });

  it('WHEN items mix valid and invalid entries THEN invalid entries are dropped', () => {
    const good = validSnapshot({ id: '1' });
    const badMissingId = { ...validSnapshot({ id: '2' }), id: undefined };
    const badSource = validSnapshot({
      id: '3',
      dataSource: 'bitbucket' as FavoriteSnapshot['dataSource'],
    });
    const badStars = { ...validSnapshot({ id: '4' }), stars: 'many' };
    const result = sanitizePersistedFavorites({
      items: [good, badMissingId, badSource, badStars, null, 7],
    });
    expect(result).toEqual({ items: [good] });
  });

  it('WHEN optional fields are omitted THEN the entry is still kept', () => {
    const minimal = validSnapshot({
      ownerAvatarUrl: undefined,
      description: undefined,
      language: undefined,
    });
    delete (minimal as { ownerAvatarUrl?: string }).ownerAvatarUrl;
    delete (minimal as { description?: string }).description;
    delete (minimal as { language?: string }).language;

    expect(sanitizePersistedFavorites({ items: [minimal] })).toEqual({ items: [minimal] });
  });
});

describe('toFavoriteSnapshot (FAV-02)', () => {
  const repo: Repo = {
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

  it('WHEN called with a repo and dataSource THEN it copies snapshot fields and sets favoritedAt', () => {
    const now = 1_711_000_000_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);

    const snapshot = toFavoriteSnapshot(repo, 'gitlab');

    expect(snapshot).toEqual({
      id: '99',
      dataSource: 'gitlab',
      name: 'demo',
      fullName: 'org/demo',
      ownerName: 'org',
      ownerAvatarUrl: 'https://example.com/o.png',
      stars: 5,
      description: 'Hello',
      language: 'Go',
      favoritedAt: now,
    });
    expect(snapshot).not.toHaveProperty('forks');
    expect(snapshot).not.toHaveProperty('watchers');
    expect(snapshot).not.toHaveProperty('htmlUrl');

    jest.restoreAllMocks();
  });

  it('WHEN optional repo fields are missing THEN snapshot omits them', () => {
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

    const snapshot = toFavoriteSnapshot(sparse, 'github');

    expect(snapshot.id).toBe('1');
    expect(snapshot.dataSource).toBe('github');
    expect(snapshot.favoritedAt).toBe(100);
    expect(snapshot).not.toHaveProperty('description');
    expect(snapshot).not.toHaveProperty('language');
    expect(snapshot).not.toHaveProperty('ownerAvatarUrl');

    jest.restoreAllMocks();
  });
});
