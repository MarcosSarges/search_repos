import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';

import type { DataSource } from '@/application';
import { DsThemeProvider, getTheme, type ThemeMode } from '@ds/theme';
import { useSessionPreferencesStore } from '@/presentation/stores/session-preferences-store';
import { useHydration } from '@/presentation/stores/use-hydration';

import { mapDataSourceToBrand } from './map-data-source-to-brand';

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

  const theme = useMemo(() => getTheme(mode, mapDataSourceToBrand(dataSource)), [mode, dataSource]);

  if (!hydrated) {
    return null;
  }

  return <DsThemeProvider theme={theme}>{children}</DsThemeProvider>;
}
