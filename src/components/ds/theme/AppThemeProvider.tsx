import { useEffect, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import * as SplashScreen from 'expo-splash-screen';

import type { DataSource } from '@/domain/entities/data-source';
import { useHydration } from '@/stores/use-hydration';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { getTheme, type ThemeMode } from './theme';

export type AppThemeControls = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  dataSource: DataSource;
  setDataSource: (dataSource: DataSource) => void;
};

type AppThemeProviderProps = {
  children?: ReactNode;
  /** Seeds store mode (Storybook / tests). Prefer seeding the store before mount when possible. */
  initialMode?: ThemeMode;
  /** Seeds store dataSource (Storybook / tests). */
  initialDataSource?: DataSource;
};

void SplashScreen.preventAutoHideAsync().catch(() => {
  /* already prevented or native unavailable in tests */
});

export function AppThemeProvider({
  children,
  initialMode,
  initialDataSource,
}: AppThemeProviderProps) {
  const hydrated = useHydration();
  const mode = useSessionPreferencesStore((state) => state.mode);
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);

  useLayoutEffect(() => {
    const state = useSessionPreferencesStore.getState();
    if (initialMode !== undefined && state.mode !== initialMode) {
      state.setMode(initialMode);
    }
    if (initialDataSource !== undefined && state.dataSource !== initialDataSource) {
      state.setDataSource(initialDataSource);
    }
  }, [initialMode, initialDataSource]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void SplashScreen.hideAsync().catch(() => {
      /* native splash unavailable in tests */
    });
  }, [hydrated]);

  const theme = useMemo(() => getTheme(mode, dataSource), [mode, dataSource]);

  if (!hydrated) {
    return null;
  }

  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}

/** Thin store wrapper — keeps the historical `useAppTheme` API for DS consumers. */
export function useAppTheme(): AppThemeControls {
  const mode = useSessionPreferencesStore((state) => state.mode);
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const setMode = useSessionPreferencesStore((state) => state.setMode);
  const setDataSource = useSessionPreferencesStore((state) => state.setDataSource);
  const toggleMode = useSessionPreferencesStore((state) => state.toggleMode);

  return {
    mode,
    setMode,
    toggleMode,
    dataSource,
    setDataSource,
  };
}
