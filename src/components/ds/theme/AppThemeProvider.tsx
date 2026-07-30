import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { getTheme, type ThemeMode } from './theme';

type ThemeContextValue = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeContextValue | null>(null);

type AppThemeProviderProps = {
  children?: ReactNode;
  /** Força um modo inicial (útil no Storybook). Sem isso, segue o sistema. */
  initialMode?: ThemeMode;
};

export function AppThemeProvider({ children, initialMode }: AppThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    initialMode ?? (systemScheme === 'dark' ? 'dark' : 'light'),
  );

  const toggleMode = useCallback(() => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
    }),
    [mode, toggleMode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
