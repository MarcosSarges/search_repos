import { type AppError, type Repo, type RepoRepository } from '@/domain';

import { createInMemoryRepoRepository } from '@/infrastructure';
import { createSearchRepos } from '../search-repos';

const sampleRepos: Repo[] = [
  {
    id: 'facebook/react',
    name: 'react',
    fullName: 'facebook/react',
    description: 'A JavaScript library for building user interfaces',
    stars: 1000,
    forks: 200,
    watchers: 1000,
    language: 'JavaScript',
    ownerName: 'facebook',
    htmlUrl: 'https://github.com/facebook/react',
  },
  {
    id: 'vercel/next.js',
    name: 'next.js',
    fullName: 'vercel/next.js',
    description: 'The React Framework',
    stars: 900,
    forks: 150,
    watchers: 900,
    language: 'JavaScript',
    ownerName: 'vercel',
    htmlUrl: 'https://github.com/vercel/next.js',
  },
];

describe('createSearchRepos', () => {
  it('rejects empty queries with empty_query', async () => {
    const searchRepos = createSearchRepos(createInMemoryRepoRepository(sampleRepos));

    await expect(searchRepos({ query: '   ' })).rejects.toMatchObject({
      code: 'empty_query',
    } satisfies Partial<AppError>);
  });

  it('returns matching repositories sorted by repository filter', async () => {
    const searchRepos = createSearchRepos(createInMemoryRepoRepository(sampleRepos));

    const result = await searchRepos({ query: 'facebook', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.fullName).toBe('facebook/react');
    expect(result.hasNextPage).toBe(false);
  });

  it('paginates results', async () => {
    const searchRepos = createSearchRepos(createInMemoryRepoRepository(sampleRepos));

    const page1 = await searchRepos({ query: 'e', page: 1, perPage: 1 });
    const page2 = await searchRepos({ query: 'e', page: 2, perPage: 1 });

    expect(page1.items).toHaveLength(1);
    expect(page1.hasNextPage).toBe(true);
    expect(page2.items).toHaveLength(1);
    expect(page2.hasNextPage).toBe(false);
  });

  it('applies default page 1 and perPage 20 when omitted', async () => {
    const search = jest.fn().mockResolvedValue({
      items: [],
      page: 1,
      perPage: 20,
      hasNextPage: false,
    });
    const repository: RepoRepository = {
      search,
      getById: jest.fn(),
      listIssues: jest.fn(),
      listTrending: jest.fn(),
    };
    const searchRepos = createSearchRepos(repository);

    await searchRepos({ query: 'react' });

    expect(search).toHaveBeenCalledWith({ query: 'react', page: 1, perPage: 20 });
  });

  it('rejects invalid page with invalid_input', async () => {
    const searchRepos = createSearchRepos(createInMemoryRepoRepository(sampleRepos));

    await expect(searchRepos({ query: 'react', page: 0 })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });

  it('rejects invalid perPage with invalid_input', async () => {
    const searchRepos = createSearchRepos(createInMemoryRepoRepository(sampleRepos));

    await expect(searchRepos({ query: 'react', perPage: 0 })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });
});
