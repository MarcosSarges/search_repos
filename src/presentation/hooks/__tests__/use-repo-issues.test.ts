import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAppError, isAppError, type Issue, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { queryKeys } from '@/presentation/constants/query-keys';
import { createQueryClient } from '@/presentation/providers/create-query-client';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, renderHook, waitFor } from '@/test/render';

import { useRepoIssues } from '../use-repo-issues';

const sampleRepo: Repo = {
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
};

const sampleIssues: Issue[] = [
  {
    id: '1',
    number: 1,
    title: 'Bug A',
    authorName: 'alice',
    labels: [],
    createdAt: '2024-01-01T00:00:00Z',
    htmlUrl: 'https://github.com/facebook/react/issues/1',
  },
  {
    id: '2',
    number: 2,
    title: 'Bug B',
    authorName: 'bob',
    labels: [],
    createdAt: '2024-01-02T00:00:00Z',
    htmlUrl: 'https://github.com/facebook/react/issues/2',
  },
];

describe('useRepoIssues (PRES-09, PRES-10..12, PRES-19)', () => {
  it('fetches pages via useInfiniteQuery using hasNextPage for next pageParam', async () => {
    const base = createInMemoryRepoRepository([sampleRepo], {
      'facebook/react': sampleIssues,
    });
    const repository: RepoRepository = {
      ...base,
      listIssues: (input) => base.listIssues({ ...input, perPage: 1 }),
    };

    const { result } = await renderHook(() => useRepoIssues({ repoId: 'facebook/react' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0]?.page).toBe(1);
    expect(result.current.data?.pages[0]?.items.map((issue) => issue.id)).toEqual(['1']);
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(result.current.data?.pages[1]?.page).toBe(2);
    expect(result.current.data?.pages[1]?.items.map((issue) => issue.id)).toEqual(['2']);
  });

  it('uses queryKey that includes active dataSource and repoId', async () => {
    const queryClient = createQueryClient();
    const repository = createInMemoryRepoRepository([sampleRepo], {
      'facebook/react': sampleIssues,
    });

    const { result } = await renderHook(() => useRepoIssues({ repoId: 'facebook/react' }), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(
      queryClient.getQueryData(queryKeys.repos.issues('github', 'facebook/react')),
    );
  });

  it('WHEN repoId is empty THEN enabled is false and listIssues is not called', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository([sampleRepo], {
      'facebook/react': sampleIssues,
    });
    const repository: RepoRepository = {
      ...base,
      listIssues: async (input) => {
        listCalls += 1;
        return base.listIssues(input);
      },
    };

    const { result } = await renderHook(() => useRepoIssues({ repoId: '' }), {
      repository,
      dataSource: 'github',
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isFetching).toBe(false);
    expect(listCalls).toBe(0);
  });

  it('WHEN dataSource toggles THEN cache keys differ and no invalidate/remove is used', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');
    const repository = createInMemoryRepoRepository([sampleRepo], {
      'facebook/react': sampleIssues,
    });

    const { result, rerender } = await renderHook(
      ({ repoId }: { repoId: string }) => useRepoIssues({ repoId }),
      {
        initialProps: { repoId: 'facebook/react' },
        repository,
        dataSource: 'github',
        queryClient,
      },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const githubData = result.current.data;

    await act(async () => {
      useSessionPreferencesStore.getState().setDataSource('gitlab');
    });
    rerender({ repoId: 'facebook/react' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(queryClient.getQueryData(queryKeys.repos.issues('gitlab', 'facebook/react'))).toBe(
      result.current.data,
    );
    expect(queryClient.getQueryData(queryKeys.repos.issues('github', 'facebook/react'))).toBe(
      githubData,
    );
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
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
        throw createAppError('forbidden');
      },
      listTrending: async () => {
        throw createAppError('not_found');
      },
    };

    const { result } = await renderHook(() => useRepoIssues({ repoId: 'facebook/react' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(isAppError(result.current.error)).toBe(true);
    expect(result.current.error).toMatchObject({ code: 'forbidden' });
  });

  it('module source does not call invalidateQueries or removeQueries', () => {
    const source = readFileSync(join(__dirname, '../use-repo-issues.ts'), 'utf8');
    expect(source).not.toMatch(/invalidateQueries|removeQueries/);
  });
});
