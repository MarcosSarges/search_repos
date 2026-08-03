import { type AppError, type Repo, type RepoRepository } from '@/domain';

import { createInMemoryRepoRepository } from '@/infrastructure';
import { createListTrendingRepos } from '../list-trending-repos';

/**
 * EXP-11: createListTrendingRepos defaults, validates page/perPage, delegates to port.
 */
const sampleRepos: Repo[] = [
  {
    id: 'b/high',
    name: 'high',
    fullName: 'b/high',
    stars: 300,
    forks: 0,
    watchers: 300,
    ownerName: 'b',
    htmlUrl: 'https://example.com/b/high',
  },
  {
    id: 'a/low',
    name: 'low',
    fullName: 'a/low',
    stars: 10,
    forks: 0,
    watchers: 10,
    ownerName: 'a',
    htmlUrl: 'https://example.com/a/low',
  },
];

describe('createListTrendingRepos (EXP-11)', () => {
  it('applies default page 1 and perPage 20 when omitted', async () => {
    const listTrending = jest.fn().mockResolvedValue({
      items: [],
      page: 1,
      perPage: 20,
      hasNextPage: false,
    });
    const repository: RepoRepository = {
      search: jest.fn(),
      getById: jest.fn(),
      listIssues: jest.fn(),
      listTrending,
    };
    const listTrendingRepos = createListTrendingRepos(repository);

    await listTrendingRepos();

    expect(listTrending).toHaveBeenCalledWith({ page: 1, perPage: 20 });
  });

  it('rejects invalid page with invalid_input', async () => {
    const listTrendingRepos = createListTrendingRepos(createInMemoryRepoRepository(sampleRepos));

    await expect(listTrendingRepos({ page: 0 })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });

  it('rejects invalid perPage with invalid_input', async () => {
    const listTrendingRepos = createListTrendingRepos(createInMemoryRepoRepository(sampleRepos));

    await expect(listTrendingRepos({ perPage: 0 })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });

  it('delegates to repository.listTrending and returns paginated repos', async () => {
    const listTrendingRepos = createListTrendingRepos(createInMemoryRepoRepository(sampleRepos));

    const result = await listTrendingRepos({ page: 1, perPage: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('b/high');
    expect(result.hasNextPage).toBe(true);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(1);
  });
});
