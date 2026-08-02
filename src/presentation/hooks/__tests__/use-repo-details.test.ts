import { isAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { queryKeys } from '@/presentation/constants/query-keys';
import { createQueryClient } from '@/presentation/providers/create-query-client';
import { act, renderHook, waitFor } from '@/test/render';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { useRepoDetails } from '../use-repo-details';

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

describe('useRepoDetails (PRES-08, PRES-12, PRES-19)', () => {
  it('fetches repo details via useQuery for a repoId', async () => {
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await renderHook(() => useRepoDetails({ repoId: 'facebook/react' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toMatchObject({
      id: 'facebook/react',
      fullName: 'facebook/react',
    });
  });

  it('uses queryKey that includes active dataSource and repoId', async () => {
    const queryClient = createQueryClient();
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result } = await renderHook(() => useRepoDetails({ repoId: 'facebook/react' }), {
      repository,
      dataSource: 'github',
      queryClient,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe(
      queryClient.getQueryData(queryKeys.repos.detail('github', 'facebook/react')),
    );
  });

  it('WHEN repoId is empty THEN enabled is false and getById is not called', async () => {
    let getByIdCalls = 0;
    const base = createInMemoryRepoRepository([sampleRepo]);
    const repository: RepoRepository = {
      ...base,
      getById: async (repoId) => {
        getByIdCalls += 1;
        return base.getById(repoId);
      },
    };

    const { result } = await renderHook(() => useRepoDetails({ repoId: '  ' }), {
      repository,
      dataSource: 'github',
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isFetching).toBe(false);
    expect(getByIdCalls).toBe(0);
  });

  it('WHEN the use case rejects with AppError THEN Query error surfaces that AppError', async () => {
    const repository = createInMemoryRepoRepository([]);

    const { result } = await renderHook(() => useRepoDetails({ repoId: 'missing/repo' }), {
      repository,
      dataSource: 'github',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(isAppError(result.current.error)).toBe(true);
    expect(result.current.error).toMatchObject({ code: 'not_found' });
  });

  it('WHEN dataSource toggles THEN cache keys differ and no invalidate/remove is used', async () => {
    const queryClient = createQueryClient();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
    const removeSpy = jest.spyOn(queryClient, 'removeQueries');
    const repository = createInMemoryRepoRepository([sampleRepo]);

    const { result, rerender } = await renderHook(
      ({ repoId }: { repoId: string }) => useRepoDetails({ repoId }),
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

    expect(queryClient.getQueryData(queryKeys.repos.detail('gitlab', 'facebook/react'))).toBe(
      result.current.data,
    );
    expect(queryClient.getQueryData(queryKeys.repos.detail('github', 'facebook/react'))).toBe(
      githubData,
    );
    expect(invalidateSpy).not.toHaveBeenCalled();
    expect(removeSpy).not.toHaveBeenCalled();
  });
});
