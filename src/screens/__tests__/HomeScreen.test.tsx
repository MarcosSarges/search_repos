import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { act, fireEvent, render, screen } from '@/test';
import {
  SESSION_PREFERENCES_STORAGE_KEY,
  useSessionPreferencesStore,
} from '@/stores/session-preferences-store';

import { HomeScreen } from '../HomeScreen';

describe('HomeScreen (TPH-07..10)', () => {
  it('WHEN Home is shown THEN Header title is Search Repos', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Search Repos')).toBeTruthy();
  });

  it('WHEN leading logo is tapped THEN dataSource toggles github ↔ gitlab', async () => {
    await render(<HomeScreen />, { dataSource: 'github' });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');

    await act(async () => {
      fireEvent.press(screen.getByTestId('home-data-source-toggle'));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab');

    await act(async () => {
      fireEvent.press(screen.getByTestId('home-data-source-toggle'));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');
  });

  it('WHEN trailing theme icon is tapped THEN mode toggles light ↔ dark and persists', async () => {
    await render(<HomeScreen />, { themeMode: 'light' });
    expect(useSessionPreferencesStore.getState().mode).toBe('light');
    expect(screen.getByLabelText('Switch to dark mode')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('home-theme-toggle'));
    });
    await Promise.resolve();

    expect(useSessionPreferencesStore.getState().mode).toBe('dark');
    expect(screen.getByLabelText('Switch to light mode')).toBeTruthy();

    const raw = await AsyncStorage.getItem(SESSION_PREFERENCES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(String(raw)) as { state: { mode: string } };
    expect(parsed.state.mode).toBe('dark');
  });

  it('WHEN HomeScreen source is inspected THEN it composes DataSourceLogo and Header does not', () => {
    const homeSource = readFileSync(join(__dirname, '../HomeScreen.tsx'), 'utf8');
    const headerSource = readFileSync(
      join(__dirname, '../../components/ds/molecules/Header/Header.tsx'),
      'utf8',
    );
    expect(homeSource).toMatch(/DataSourceLogo/);
    expect(headerSource).not.toMatch(/DataSourceLogo/);
  });
});

describe('App product wiring (PRES-17)', () => {
  it('WHEN App product entry is inspected THEN Query and Container wrap RootNavigator; Storybook branch unchanged', () => {
    const appSource = readFileSync(join(__dirname, '../../App.tsx'), 'utf8');

    expect(appSource).toMatch(/AppQueryProvider/);
    expect(appSource).toMatch(/AppContainerProvider/);
    expect(appSource).toMatch(/RootNavigator/);

    const queryIdx = appSource.indexOf('<AppQueryProvider>');
    const containerIdx = appSource.indexOf('<AppContainerProvider>');
    const navIdx = appSource.indexOf('<RootNavigator');
    expect(queryIdx).toBeGreaterThan(-1);
    expect(containerIdx).toBeGreaterThan(queryIdx);
    expect(navIdx).toBeGreaterThan(containerIdx);

    expect(appSource).toMatch(/storybookEnabled/);
    expect(appSource).toMatch(/\.rnstorybook/);
  });
});
