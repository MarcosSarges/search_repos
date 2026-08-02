import { useQuery } from '@tanstack/react-query';

import { useAppContainer } from './use-app-container';
import { queryKeys } from '../query-keys';

type UseRepoDetailsOptions = {
  repoId: string;
  enabled?: boolean;
};

export function useRepoDetails({ repoId, enabled }: UseRepoDetailsOptions) {
  const { container, dataSource } = useAppContainer();
  const trimmed = repoId.trim();
  const isEnabled = enabled ?? trimmed.length > 0;

  return useQuery({
    queryKey: queryKeys.repos.detail(dataSource, trimmed),
    queryFn: () => container.getRepoDetails({ repoId: trimmed }),
    enabled: isEnabled,
  });
}
