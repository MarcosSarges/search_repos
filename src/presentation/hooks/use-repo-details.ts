import { useQuery } from '@tanstack/react-query';

import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { queryKeys } from '../query-keys';
import { useAppContainer } from '../providers/AppContainerProvider';

type UseRepoDetailsOptions = {
  repoId: string;
  enabled?: boolean;
};

export function useRepoDetails({ repoId, enabled }: UseRepoDetailsOptions) {
  const container = useAppContainer();
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const trimmed = repoId.trim();
  const isEnabled = enabled ?? trimmed.length > 0;

  return useQuery({
    queryKey: queryKeys.repos.detail(dataSource, trimmed),
    queryFn: () => container.getRepoDetails({ repoId: trimmed }),
    enabled: isEnabled,
  });
}
