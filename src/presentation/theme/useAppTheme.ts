import type { ThemeMode } from '@ds/theme';
import { useSessionPreferencesStore } from '@/presentation/stores/session-preferences-store';

import type { AppThemeControls } from './AppThemeProvider';

/** Thin store wrapper — keeps the historical `useAppTheme` API for product UI. */
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

export type { AppThemeControls, ThemeMode };
