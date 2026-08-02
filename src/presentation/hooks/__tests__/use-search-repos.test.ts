import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAppError, isAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { queryKeys } from '@/presentation/constants/query-keys';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, renderHook, waitFor } from '@/test/render';
import { createQueryClient } from '@/presentation/providers/create-query-client';

import { useSearchRepos } from '../use-search-repos';

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

describe('useSearchRepos (PRES-07, PRES-10..12, PRES-19)', () => {
  it('fetches pages via useInfiniteQuery using hasNextPage for next pageParam', async () => {
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: (input) => base.search({ ...input, perPage: 1 }),
    };

    const { result } = await renderHook(() => useSearchRepos({ query: 'e' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]?.page).toBe(1);
    expect(result.current.data?.pages[0]?.items).toHaveLength(1);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(result.current.data?.pages[1]?.page).toBe(2);
    expect(result.current.data?.pages[1]?.items).toHaveLength(1);
  });

  it('uses queryKey that includes active dataSource and query', async () => {
    const queryClient = createQueryClient();
    const repository = createInMemoryRepoRepository(sampleRepos);

    const { result } = await renderHook(() => useSearchRepos({ query: 'react' }), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(
      queryClient.getQueryData(queryKeys.repos.search('github', 'react')),
    );
  });

  it('WHEN query is empty THEN enabled is false and the use case is not called', async () => {
    let searchCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: async (input) => {
        searchCalls += 1;
        return base.search(input);
      },
    };

    const { result } = await renderHook(() => useSearchRepos({ query: '   ' }), {
      repository,
      dataSource: 'github',
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isFetching).toBe(false);
    expect(searchCalls).toBe(0);
  });

  it('WHEN dataSource toggles THEN cache keys differ and no invalidate/remove is used', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');
    const repository = createInMemoryRepoRepository(sampleRepos);

    const { result, rerender } = await renderHook(
      ({ query }: { query: string }) => useSearchRepos({ query }),
      {
        initialProps: { query: 'react' },
        repository,
        dataSource: 'github',
        queryClient,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const githubData = result.current.data;
    expect(queryClient.getQueryData(queryKeys.repos.search('github', 'react'))).toBe(githubData);

    await act(async () => {
      useSessionPreferencesStore.getState().setDataSource('gitlab');
    });
    rerender({ query: 'react' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
    });

    expect(queryClient.getQueryData(queryKeys.repos.search('gitlab', 'react'))).toBeDefined();
    expect(queryClient.getQueryData(queryKeys.repos.search('github', 'react'))).toBe(githubData);
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('WHEN the use case rejects with AppError THEN Query error surfaces that AppError', async () => {
    const repository: RepoRepository = {
      search: async () => {
        throw createAppError('rate_limit');
      },
      getById: async () => {
        throw createAppError('not_found');
      },
      listIssues: async () => {
        throw createAppError('not_found');
      },
    };

    const { result } = await renderHook(() => useSearchRepos({ query: 'react' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(isAppError(result.current.error)).toBe(true);
    expect(result.current.error).toMatchObject({ code: 'rate_limit' });
  });

  it('module source does not call invalidateQueries or removeQueries', () => {
    const source = readFileSync(join(__dirname, '../use-search-repos.ts'), 'utf8');
    expect(source).not.toMatch(/invalidateQueries|removeQueries/);
  });
});
