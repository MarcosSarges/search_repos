import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { act, fireEvent, render, screen } from '@/test';
import {
  SESSION_PREFERENCES_STORAGE_KEY,
  useSessionPreferencesStore,
} from '@/presentation/stores/session-preferences-store';

import { ConfigScreen } from '../ConfigScreen';

describe('ConfigScreen (DIC-09)', () => {
  it('WHEN Config is shown THEN Header title is Config and three settings rows are present', async () => {
    await render(<ConfigScreen />);
    expect(screen.getByText('Config')).toBeTruthy();
    expect(screen.getByTestId('config-theme-section')).toBeTruthy();
    expect(screen.getByTestId('config-source-section')).toBeTruthy();
    expect(screen.getByTestId('config-token-section')).toBeTruthy();
    expect(screen.getByText('Tema')).toBeTruthy();
    expect(screen.getByText('Fonte ativa')).toBeTruthy();
    expect(screen.getByText('Token de API')).toBeTruthy();
  });

  it('WHEN Config renders THEN source row is read-only GitHub/GitLab without a data-source toggle', async () => {
    await render(<ConfigScreen />, { dataSource: 'github' });

    expect(screen.getByTestId('config-source-section')).toBeTruthy();
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.queryByTestId('config-data-source-toggle')).toBeNull();
    expect(screen.getByTestId('config-source-section').props.accessibilityRole).not.toBe('button');
  });

  it('WHEN session dataSource is gitlab THEN source row shows GitLab', async () => {
    await render(<ConfigScreen />, { dataSource: 'gitlab' });

    expect(screen.getByText('GitLab')).toBeTruthy();
    expect(screen.queryByText('GitHub')).toBeNull();
  });

  it('WHEN ConfigScreen source is inspected THEN it has no DataSourceLogo, toggleDataSource, or setDataSource', () => {
    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    expect(configSource).not.toMatch(/DataSourceLogo/);
    expect(configSource).not.toMatch(/toggleDataSource/);
    expect(configSource).not.toMatch(/setDataSource/);
    expect(configSource).not.toMatch(/config-data-source/);
    expect(configSource).toMatch(/SettingsRow/);
    expect(configSource).toMatch(/git-branch-outline/);
  });

  it('WHEN theme trailing Button is used THEN it hugs content (not width full) so title stays visible', () => {
    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    expect(configSource).toMatch(/width=["']hug["']/);
  });

  it('WHEN Config renders with theme trailing THEN Tema title remains visible beside the toggle', async () => {
    await render(<ConfigScreen />);
    expect(screen.getByText('Tema')).toBeTruthy();
    expect(screen.getByText('Alternar entre claro e escuro')).toBeTruthy();
    expect(screen.getByTestId('config-theme-toggle')).toBeTruthy();
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
    expect(screen.getByTestId('config-token-section')).toBeTruthy();
    expect(screen.getByText(/Em breve/)).toBeTruthy();

    const configSource = readFileSync(join(__dirname, '../ConfigScreen.tsx'), 'utf8');
    expect(configSource).not.toMatch(/SecureStore/);
    expect(configSource).not.toMatch(/setToken/);
    expect(configSource).not.toMatch(/TextInput/);
  });
});
