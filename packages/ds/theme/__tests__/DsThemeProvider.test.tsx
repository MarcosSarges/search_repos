import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Text } from 'react-native';

import { render, screen } from '@/test';

import { DsThemeProvider } from '../DsThemeProvider';
import { getTheme } from '../theme';
import { useTheme } from '../useTheme';

function ThemePrimaryProbe() {
  const theme = useTheme();
  return <Text testID="theme-primary">{theme.colors.primary}</Text>;
}

function ThemeBrandProbe() {
  const theme = useTheme();
  return <Text testID="theme-brand">{theme.brand}</Text>;
}

describe('DsThemeProvider (DSLIB-04)', () => {
  it('WHEN mounted with an injected theme THEN styled consumers receive that theme object', async () => {
    const theme = getTheme('dark', 'gitlab');

    await render(
      <DsThemeProvider theme={theme}>
        <ThemePrimaryProbe />
        <ThemeBrandProbe />
      </DsThemeProvider>,
    );

    expect(screen.getByTestId('theme-primary').props.children).toBe('#FCA326');
    expect(screen.getByTestId('theme-brand').props.children).toBe('gitlab');
  });

  it('WHEN provider source is inspected THEN it has no Zustand or splash imports', () => {
    const source = readFileSync(join(__dirname, '../DsThemeProvider.tsx'), 'utf8');

    expect(source).not.toMatch(/zustand|useSessionPreferencesStore|SplashScreen|SecureStore/i);
  });
});
