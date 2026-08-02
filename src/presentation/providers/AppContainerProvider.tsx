import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import type { RepoRepository } from '@/domain';
import {
  createContainer,
  type AppContainer,
} from '@/infrastructure/di/create-container';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

const AppContainerContext = createContext<AppContainer | null>(null);

type AppContainerProviderProps = {
  children: ReactNode;
  repository?: RepoRepository;
};

export function AppContainerProvider({
  children,
  repository,
}: AppContainerProviderProps) {
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const tokens = useSessionPreferencesStore((state) => state.tokens);

  const container = useMemo(
    () => createContainer({ dataSource, tokens, repository }),
    [dataSource, tokens, repository],
  );

  return (
    <AppContainerContext.Provider value={container}>{children}</AppContainerContext.Provider>
  );
}

export function useAppContainer(): AppContainer {
  const container = useContext(AppContainerContext);
  if (container == null) {
    throw new Error('useAppContainer must be used within AppContainerProvider');
  }
  return container;
}
