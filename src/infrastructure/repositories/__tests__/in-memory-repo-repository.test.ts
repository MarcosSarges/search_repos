import { isAppError, type Repo } from '@/domain';

import { createInMemoryRepoRepository } from '../in-memory-repo-repository';

/**
 * APP-08 / DOM-11: Fake under infrastructure; port rejects are AppError with not_found.
 */
describe('createInMemoryRepoRepository (APP-08, DOM-11)', () => {
  it('WHEN getById is called for a missing id THEN it rejects with AppError not_found', async () => {
    const repository = createInMemoryRepoRepository([]);

    const rejection = await repository.getById('missing-repo').catch((error: unknown) => error);

    expect(isAppError(rejection)).toBe(true);
    expect(rejection).toMatchObject({ code: 'not_found' });
  });
});

/**
 * EXP-15: Fake listTrending sorts by stars desc and paginates.
 * Date window is intentionally ignored (documented Fake behavior).
 */
describe('createInMemoryRepoRepository listTrending (EXP-15)', () => {
  function repo(partial: Partial<Repo> & Pick<Repo, 'id' | 'name' | 'stars'>): Repo {
    return {
      fullName: partial.fullName ?? `${partial.ownerName ?? 'org'}/${partial.name}`,
      description: partial.description,
      forks: partial.forks ?? 0,
      watchers: partial.watchers ?? partial.stars,
      language: partial.language,
      ownerName: partial.ownerName ?? 'org',
      htmlUrl: partial.htmlUrl ?? `https://example.com/${partial.id}`,
      ...partial,
    };
  }

  const seeded: Repo[] = [
    repo({ id: 'a/low', name: 'low', stars: 10, ownerName: 'a' }),
    repo({ id: 'b/high', name: 'high', stars: 300, ownerName: 'b' }),
    repo({ id: 'c/mid', name: 'mid', stars: 100, ownerName: 'c' }),
  ];

  it('WHEN listTrending is called THEN items are ordered by stars descending', async () => {
    const repository = createInMemoryRepoRepository(seeded);

    const result = await repository.listTrending({ page: 1, perPage: 20 });

    expect(result.items.map((item) => item.id)).toEqual(['b/high', 'c/mid', 'a/low']);
    expect(result.hasNextPage).toBe(false);
  });

  it('WHEN multiple pages are requested THEN pagination slices and hasNextPage are correct', async () => {
    const repository = createInMemoryRepoRepository(seeded);

    const page1 = await repository.listTrending({ page: 1, perPage: 2 });
    const page2 = await repository.listTrending({ page: 2, perPage: 2 });

    expect(page1.items.map((item) => item.id)).toEqual(['b/high', 'c/mid']);
    expect(page1.hasNextPage).toBe(true);
    expect(page1.page).toBe(1);
    expect(page1.perPage).toBe(2);

    expect(page2.items.map((item) => item.id)).toEqual(['a/low']);
    expect(page2.hasNextPage).toBe(false);
    expect(page2.page).toBe(2);
  });

  it('WHEN perPage is omitted THEN default page size 20 is used', async () => {
    const repository = createInMemoryRepoRepository(seeded);

    const result = await repository.listTrending({ page: 1 });

    expect(result.perPage).toBe(20);
    expect(result.items).toHaveLength(3);
  });
});
