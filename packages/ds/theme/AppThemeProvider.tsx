import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import type { DataSource } from '@/application';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { useHydration } from '@/stores/use-hydration';

import { getTheme, type Brand, type ThemeMode } from './theme';

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

export function AppThemeProvider({
  children,
  initialMode,
  initialDataSource,
}: AppThemeProviderProps) {
  const hydrated = useHydration();
  const mode = useSessionPreferencesStore((state) => state.mode);
  const dataSource = useSessionPreferencesStore((state) => state.dataSource);
  const tokensHydrateStarted = useRef(false);

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
    if (tokensHydrateStarted.current) {
      return;
    }
    tokensHydrateStarted.current = true;
    void useSessionPreferencesStore.getState().hydrateTokensFromSecureStore();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void SplashScreen.hideAsync().catch(() => {
      /* native splash unavailable in tests */
    });
  }, [hydrated]);

  // DataSource and Brand share the same union today; explicit map lands in presentation (T6).
  const theme = useMemo(
    () => getTheme(mode, dataSource as Brand),
    [mode, dataSource],
  );

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
