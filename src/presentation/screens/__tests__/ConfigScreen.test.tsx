import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { act, fireEvent, render, screen } from '@/test';
import {
  SESSION_PREFERENCES_STORAGE_KEY,
  useSessionPreferencesStore,
} from '@/stores/session-preferences-store';

import { ConfigScreen } from '../ConfigScreen';

describe('ConfigScreen (CFG-01..03)', () => {
  it('WHEN Config is shown THEN Header title is Config and sections are present', async () => {
    await render(<ConfigScreen />);
    expect(screen.getByText('Config')).toBeTruthy();
    expect(screen.getByTestId('config-data-source-section')).toBeTruthy();
    expect(screen.getByTestId('config-theme-section')).toBeTruthy();
    expect(screen.getByTestId('config-token-section')).toBeTruthy();
  });

  it('WHEN data source control is tapped THEN dataSource toggles github ↔ gitlab', async () => {
    await render(<ConfigScreen />, { dataSource: 'github' });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');

    await act(async () => {
      fireEvent.press(screen.getByTestId('config-data-source-toggle'));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab');

    await act(async () => {
      fireEvent.press(screen.getByTestId('config-data-source-toggle'));
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');
  });

  it('WHEN theme control is tapped THEN mode toggles light ↔ dark and persists', async () => {
    await render(<ConfigScreen />, { themeMode: 'light' });
    expect(useSessionPreferencesStore.getState().mode).toBe('light');
    expect(screen.getByLabelText('Switch to dark mode')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('config-theme-toggle'));
    });
    await Promise.resolve();

    expect(useSessionPreferencesStore.getState().mode).toBe('dark');
    expect(screen.getByLabelText('Switch to light mode')).toBeTruthy();

    const raw = await AsyncStorage.getItem(SESSION_PREFERENCES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(String(raw)) as { state: { mode: string } };
    expect(parsed.state.mode).toBe('dark');
  });

  it('WHEN Config renders THEN token placeholder is visible without SecureStore form', async () => {
    await render(<ConfigScreen />);
    expect(screen.getByTestId('config-token-placeholder')).toBeTruthy();
    expect(screen.getByText(/Em breve/)).toBeTruthy();

    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    expect(configSource).not.toMatch(/SecureStore/);
    expect(configSource).not.toMatch(/setToken/);
    expect(configSource).not.toMatch(/TextInput/);
  });

  it('WHEN ConfigScreen source is inspected THEN it composes DataSourceLogo and Header does not', () => {
    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    const headerSource = readFileSync(
      join(__dirname, '../../../../packages/ds/molecules/Header/Header.tsx'),
      'utf8',
    );
    expect(configSource).toMatch(/DataSourceLogo/);
    expect(headerSource).not.toMatch(/DataSourceLogo/);
  });
});
