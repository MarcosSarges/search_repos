import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAppError, isAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { queryKeys } from '@/presentation/constants/query-keys';
import { createQueryClient } from '@/presentation/providers/create-query-client';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, renderHook, waitFor } from '@/test/render';

import { useListTrendingRepos } from '../use-list-trending-repos';

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

describe('useListTrendingRepos (EXP-01,03,06,08,09,16,17)', () => {
  it('fetches first page via container.listTrendingRepos (EXP-01)', async () => {
    const repository = createInMemoryRepoRepository(sampleRepos);

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]?.page).toBe(1);
    expect(result.current.data?.pages[0]?.items.map((repo) => repo.id)).toEqual([
      'facebook/react',
      'vercel/next.js',
    ]);
  });

  it('WHEN hasNextPage is true THEN fetchNextPage appends the next page (EXP-06)', async () => {
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      listTrending: (input) => base.listTrending({ ...input, perPage: 1 }),
    };

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

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

  it('WHEN hasNextPage is false THEN fetchNextPage does not issue another listTrending call (EXP-08)', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      listTrending: async (input) => {
        listCalls += 1;
        return base.listTrending(input);
      },
    };

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.hasNextPage).toBe(false);
    const callsAfterFirst = listCalls;

    await act(async () => {
      await result.current.fetchNextPage();
    });

    expect(listCalls).toBe(callsAfterFirst);
  });

  it('uses queryKey that includes active dataSource (EXP-03)', async () => {
    const queryClient = createQueryClient();
    const repository = createInMemoryRepoRepository(sampleRepos);

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(queryClient.getQueryData(queryKeys.repos.trending('github')));
  });

  it('WHEN dataSource toggles THEN cache keys differ and no invalidate/remove is used (EXP-03)', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');
    const repository = createInMemoryRepoRepository(sampleRepos);

    const { result, rerender } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const githubData = result.current.data;
    expect(queryClient.getQueryData(queryKeys.repos.trending('github'))).toBe(githubData);

    await act(async () => {
      useSessionPreferencesStore.getState().setDataSource('gitlab');
    });
    rerender();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
    });

    expect(queryClient.getQueryData(queryKeys.repos.trending('gitlab'))).toBeDefined();
    expect(queryClient.getQueryData(queryKeys.repos.trending('github'))).toBe(githubData);
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('WHEN cached data exists for current dataSource THEN shows cached items while background refetch runs (EXP-17)', async () => {
    const queryClient = createQueryClient();
    const seededPage = {
      items: sampleRepos,
      page: 1,
      perPage: 20,
      hasNextPage: false,
    };
    queryClient.setQueryData(
      queryKeys.repos.trending('github'),
      {
        pages: [seededPage],
        pageParams: [1],
      },
      { updatedAt: 0 },
    );

    let resolveList!: (value: Awaited<ReturnType<RepoRepository['listTrending']>>) => void;
    const repository: RepoRepository = {
      ...createInMemoryRepoRepository(sampleRepos),
      listTrending: () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    };

    const { result, unmount } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    expect(result.current.data?.pages[0]?.items.map((repo) => repo.id)).toEqual([
      'facebook/react',
      'vercel/next.js',
    ]);

    await waitFor(() => {
      expect(result.current.isFetching || result.current.isRefetching).toBe(true);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data?.pages[0]?.items.map((repo) => repo.id)).toEqual([
      'facebook/react',
      'vercel/next.js',
    ]);

    await act(async () => {
      resolveList(seededPage);
    });

    await waitFor(() => {
      expect(result.current.isFetching).toBe(false);
    });

    unmount();
  });

  it('WHEN refetch THEN replaces with fresh first page (EXP-09)', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      listTrending: async (input) => {
        listCalls += 1;
        return base.listTrending(input);
      },
    };

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(listCalls).toBe(1);

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(listCalls).toBeGreaterThanOrEqual(2);
    });

    expect(result.current.data?.pages[0]?.page).toBe(1);
    expect(result.current.data?.pages[0]?.items).toHaveLength(2);
  });

  it('WHEN first fetch is pending with no data THEN isPending is true (EXP-16)', async () => {
    let resolveList!: (value: Awaited<ReturnType<RepoRepository['listTrending']>>) => void;
    const repository: RepoRepository = {
      ...createInMemoryRepoRepository(sampleRepos),
      listTrending: () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    };

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();

    await act(async () => {
      resolveList({
        items: sampleRepos,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('WHEN the use case rejects with AppError THEN Query error surfaces that AppError', async () => {
    const repository: RepoRepository = {
      search: async () => {
        throw createAppError('network');
      },
      getById: async () => {
        throw createAppError('not_found');
      },
      listIssues: async () => {
        throw createAppError('not_found');
      },
      listTrending: async () => {
        throw createAppError('rate_limit');
      },
    };

    const { result } = await renderHook(() => useListTrendingRepos(), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(isAppError(result.current.error)).toBe(true);
    expect(result.current.error).toMatchObject({ code: 'rate_limit' });
  });

  it('module source does not call invalidateQueries or removeQueries (EXP-03)', () => {
    const source = readFileSync(join(__dirname, '../use-list-trending-repos.ts'), 'utf8');
    expect(source).not.toMatch(/invalidateQueries|removeQueries/);
  });
});
