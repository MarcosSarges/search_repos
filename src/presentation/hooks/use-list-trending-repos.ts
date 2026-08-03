import { useInfiniteQuery } from '@tanstack/react-query';

import { DEFAULT_PAGE } from '@/application/constants/pagination';

import { useAppContainer } from './use-app-container';
import { queryKeys } from '../constants/query-keys';

type UseListTrendingReposOptions = {
  enabled?: boolean;
};

export function useListTrendingRepos({ enabled = true }: UseListTrendingReposOptions = {}) {
  const { container, dataSource } = useAppContainer();

  return useInfiniteQuery({
    queryKey: queryKeys.repos.trending(dataSource),
    queryFn: ({ pageParam }) => container.listTrendingRepos({ page: pageParam }),
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled,
  });
}
