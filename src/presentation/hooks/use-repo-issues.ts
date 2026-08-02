import { useInfiniteQuery } from '@tanstack/react-query';

import { DEFAULT_PAGE } from '@/application/constants/pagination';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { queryKeys } from '../query-keys';
import { useAppContainer } from '../providers/AppContainerProvider';

type UseRepoIssuesOptions = {
  repoId: string;
  enabled?: boolean;
};

export function useRepoIssues({ repoId, enabled }: UseRepoIssuesOptions) {
  const container = useAppContainer();
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const trimmed = repoId.trim();
  const isEnabled = enabled ?? trimmed.length > 0;

  return useInfiniteQuery({
    queryKey: queryKeys.repos.issues(dataSource, trimmed),
    queryFn: ({ pageParam }) => container.listRepoIssues({ repoId: trimmed, page: pageParam }),
    initialPageParam: DEFAULT_PAGE,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: isEnabled,
  });
}
