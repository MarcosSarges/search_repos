import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { act, fireEvent, render, screen } from '@/test';
import {
  SESSION_PREFERENCES_STORAGE_KEY,
  useSessionPreferencesStore,
} from '@/presentation/stores/session-preferences-store';

import { ConfigScreen } from '../ConfigScreen';

describe('ConfigScreen (CFG-01..03, RDI-04)', () => {
  it('WHEN Config is shown THEN Header title is Config and theme + token sections are present', async () => {
    await render(<ConfigScreen />);
    expect(screen.getByText('Config')).toBeTruthy();
    expect(screen.getByTestId('config-theme-section')).toBeTruthy();
    expect(screen.getByTestId('config-token-section')).toBeTruthy();
  });

  it('WHEN Config renders THEN it does not expose a data-source toggle or fonte section (RDI-04)', async () => {
    await render(<ConfigScreen />);

    expect(screen.queryByTestId('config-data-source-toggle')).toBeNull();
    expect(screen.queryByTestId('config-data-source-section')).toBeNull();
    expect(screen.queryByText('Fonte de dados')).toBeNull();
  });

  it('WHEN ConfigScreen source is inspected THEN it has no DataSourceLogo or toggleDataSource', () => {
    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    expect(configSource).not.toMatch(/DataSourceLogo/);
    expect(configSource).not.toMatch(/toggleDataSource/);
    expect(configSource).not.toMatch(/config-data-source/);
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
});
