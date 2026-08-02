import { type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  waitFor,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react-native';
import type { QueryClient } from '@tanstack/react-query';

import { AppThemeProvider, type ThemeMode } from '@/components/ds';
import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';
import { AppContainerProvider } from '@/presentation/providers/AppContainerProvider';
import { AppQueryProvider } from '@/presentation/providers/AppQueryProvider';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

const initialSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function seedSessionPreferences(themeMode?: ThemeMode, dataSource?: DataSource) {
  const state = useSessionPreferencesStore.getState();
  if (themeMode !== undefined) {
    state.setMode(themeMode);
  }
  if (dataSource !== undefined) {
    state.setDataSource(dataSource);
  }
  // Jest mock reset restores hydrate flags false; re-arm gate for each render.
  state.setHasHydrated(true);
  state.setHasTokensHydrated(true);
}

type AllTheProvidersProps = {
  children: ReactNode;
  repository?: RepoRepository;
  queryClient?: QueryClient;
};

export function AllTheProviders({
  children,
  repository,
  queryClient,
}: AllTheProvidersProps) {
  return (
    <SafeAreaProvider initialMetrics={initialSafeAreaMetrics}>
      <AppThemeProvider>
        <AppQueryProvider client={queryClient}>
          <AppContainerProvider repository={repository}>{children}</AppContainerProvider>
        </AppQueryProvider>
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  themeMode?: ThemeMode;
  dataSource?: DataSource;
  repository?: RepoRepository;
  queryClient?: QueryClient;
};

async function waitForSessionHydration() {
  await waitFor(() => {
    expect(useSessionPreferencesStore.getState().hasHydrated).toBe(true);
    expect(useSessionPreferencesStore.getState().hasTokensHydrated).toBe(true);
  });
}

export async function render(
  ui: ReactElement,
  {
    themeMode = 'light',
    dataSource,
    repository,
    queryClient,
    ...options
  }: CustomRenderOptions = {},
): Promise<RenderResult> {
  seedSessionPreferences(themeMode, dataSource);
  await waitForSessionHydration();

  return rtlRender(ui, {
    ...options,
    wrapper: ({ children }) => (
      <AllTheProviders repository={repository} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
  });
}

type CustomRenderHookOptions<Props> = Omit<RenderHookOptions<Props>, 'wrapper'> & {
  themeMode?: ThemeMode;
  dataSource?: DataSource;
  repository?: RepoRepository;
  queryClient?: QueryClient;
};

export async function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  {
    themeMode = 'light',
    dataSource,
    repository,
    queryClient,
    ...options
  }: CustomRenderHookOptions<Props> = {},
): Promise<RenderHookResult<Result, Props>> {
  seedSessionPreferences(themeMode, dataSource);
  await waitForSessionHydration();

  return rtlRenderHook(callback, {
    ...options,
    wrapper: ({ children }) => (
      <AllTheProviders repository={repository} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
  });
}

export { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
