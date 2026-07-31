import { type AppError, type Repo } from '@/domain';

import { createInMemoryRepoRepository } from '../../fakes/in-memory-repo-repository';
import { createSearchReposUseCase } from '../search-repos';

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
    ownerAvatarUrl: null,
    htmlUrl: 'https://github.com/facebook/react',
    source: 'github',
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
    ownerAvatarUrl: null,
    htmlUrl: 'https://github.com/vercel/next.js',
    source: 'github',
  },
];

describe('createSearchReposUseCase', () => {
  it('rejects empty queries', async () => {
    const useCase = createSearchReposUseCase(createInMemoryRepoRepository(sampleRepos));

    await expect(useCase.execute({ query: '   ' })).rejects.toMatchObject({
      code: 'empty_query',
    } satisfies Partial<AppError>);
  });

  it('returns matching repositories sorted by repository filter', async () => {
    const useCase = createSearchReposUseCase(createInMemoryRepoRepository(sampleRepos));

    const result = await useCase.execute({ query: 'facebook', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.fullName).toBe('facebook/react');
    expect(result.hasNextPage).toBe(false);
    expect(result.totalCount).toBe(1);
  });

  it('paginates results', async () => {
    const useCase = createSearchReposUseCase(createInMemoryRepoRepository(sampleRepos));

    const page1 = await useCase.execute({ query: 'e', page: 1, perPage: 1 });
    const page2 = await useCase.execute({ query: 'e', page: 2, perPage: 1 });

    expect(page1.items).toHaveLength(1);
    expect(page1.hasNextPage).toBe(true);
    expect(page2.items).toHaveLength(1);
    expect(page2.hasNextPage).toBe(false);
  });
});
