import { useMemo } from 'react';

import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';
import { createContainer, type AppContainer } from '@/infrastructure/di/create-container';
import { useSessionPreferencesStore } from '@/presentation/stores/session-preferences-store';

/** Test-only Fake injection — product code must not call this. */
let testRepositoryOverride: RepoRepository | undefined;

export function setAppContainerTestRepository(repository?: RepoRepository): void {
  testRepositoryOverride = repository;
}

export type AppContainerHandle = {
  container: AppContainer;
  dataSource: DataSource;
};

/**
 * Derives the DI container from the session store (dataSource + tokens).
 * No React Context — Zustand is the single source of session truth.
 */
export function useAppContainer(): AppContainerHandle {
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const tokens = useSessionPreferencesStore((state) => state.tokens);

  const container = useMemo(
    () =>
      createContainer({
        dataSource,
        tokens,
        repository: testRepositoryOverride,
      }),
    [dataSource, tokens],
  );

  return { container, dataSource };
}
