import { useInfiniteQuery } from '@tanstack/react-query';

import { DEFAULT_PAGE } from '@/application/constants/pagination';

import { useAppContainer } from './use-app-container';
import { queryKeys } from '../constants/query-keys';

type UseSearchReposOptions = {
  query: string;
  enabled?: boolean;
};

export function useSearchRepos({ query, enabled }: UseSearchReposOptions) {
  const { container, dataSource } = useAppContainer();
  const trimmed = query.trim();
  const isEnabled = enabled ?? trimmed.length > 0;

  return useInfiniteQuery({
    queryKey: queryKeys.repos.search(dataSource, trimmed),
    queryFn: ({ pageParam }) => container.searchRepos({ query: trimmed, page: pageParam }),
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: isEnabled,
  });
}
