import type { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import type { AppTheme } from './theme';

export type DsThemeProviderProps = {
  theme: AppTheme;
  children?: ReactNode;
};

export function DsThemeProvider({ theme, children }: DsThemeProviderProps) {
  return <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>;
}
