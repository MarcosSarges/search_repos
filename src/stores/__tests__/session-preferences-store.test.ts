import { Appearance } from 'react-native';

import { createMemoryStorage } from '@/test/memory-storage';

import {
  createSessionPreferencesStore,
  sanitizePersistedPreferences,
  SESSION_PREFERENCES_STORAGE_KEY,
  systemThemeMode,
} from '../session-preferences-store';

describe('session-preferences store (TPH-01..04)', () => {
  beforeEach(() => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('WHEN store is created THEN it exposes mode, dataSource, setters, toggles, and reset', () => {
    const store = createSessionPreferencesStore({ storage: createMemoryStorage() });
    const state = store.getState();

    expect(state.mode).toBe('light');
    expect(state.dataSource).toBe('github');
    expect(typeof state.setMode).toBe('function');
    expect(typeof state.toggleMode).toBe('function');
    expect(typeof state.setDataSource).toBe('function');
    expect(typeof state.toggleDataSource).toBe('function');
    expect(typeof state.reset).toBe('function');
  });

  it('WHEN mode or dataSource changes THEN both are persisted under the storage key', async () => {
    const memory = createMemoryStorage();
    const store = createSessionPreferencesStore({ storage: memory });

    store.getState().setMode('dark');
    store.getState().setDataSource('gitlab');

    await Promise.resolve();

    const raw = await memory.getItem(SESSION_PREFERENCES_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(String(raw)) as { state: { mode: string; dataSource: string } };
    expect(parsed.state.mode).toBe('dark');
    expect(parsed.state.dataSource).toBe('gitlab');
  });

  it('WHEN cold-start rehydrates a persisted pair THEN store restores that exact mode and dataSource', async () => {
    const memory = createMemoryStorage();
    const first = createSessionPreferencesStore({ storage: memory });
    first.getState().setMode('dark');
    first.getState().setDataSource('gitlab');
    await Promise.resolve();

    const second = createSessionPreferencesStore({ storage: memory });
    await second.persist.rehydrate();

    expect(second.getState().mode).toBe('dark');
    expect(second.getState().dataSource).toBe('gitlab');
  });

  it('WHEN Appearance is dark and storage is empty THEN mode falls back to system dark and dataSource is github', async () => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    const store = createSessionPreferencesStore({ storage: createMemoryStorage() });
    await store.persist.rehydrate();

    expect(systemThemeMode()).toBe('dark');
    expect(store.getState().mode).toBe('dark');
    expect(store.getState().dataSource).toBe('github');
  });

  it('WHEN persisted payload has invalid enums THEN sanitize returns null and store uses system mode + github', async () => {
    expect(sanitizePersistedPreferences({ mode: 'neon', dataSource: 'bitbucket' })).toBeNull();
    expect(sanitizePersistedPreferences(null)).toBeNull();

    const memory = createMemoryStorage();
    await memory.setItem(
      SESSION_PREFERENCES_STORAGE_KEY,
      JSON.stringify({ state: { mode: 'neon', dataSource: 'bitbucket' }, version: 0 }),
    );

    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const store = createSessionPreferencesStore({ storage: memory });
    await store.persist.rehydrate();

    expect(store.getState().mode).toBe('light');
    expect(store.getState().dataSource).toBe('github');
  });

  it('WHEN reset is called THEN in-memory defaults apply and storage key is cleared', async () => {
    const memory = createMemoryStorage();
    const store = createSessionPreferencesStore({ storage: memory });

    store.getState().setMode('dark');
    store.getState().setDataSource('gitlab');
    await Promise.resolve();
    expect(await memory.getItem(SESSION_PREFERENCES_STORAGE_KEY)).toBeTruthy();

    store.getState().reset();
    await Promise.resolve();

    expect(store.getState().mode).toBe('light');
    expect(store.getState().dataSource).toBe('github');
    expect(await memory.getItem(SESSION_PREFERENCES_STORAGE_KEY)).toBeNull();
  });

  it('WHEN toggleMode and toggleDataSource run THEN values flip', () => {
    const store = createSessionPreferencesStore({ storage: createMemoryStorage() });

    store.getState().toggleMode();
    expect(store.getState().mode).toBe('dark');
    store.getState().toggleMode();
    expect(store.getState().mode).toBe('light');

    store.getState().toggleDataSource();
    expect(store.getState().dataSource).toBe('gitlab');
    store.getState().toggleDataSource();
    expect(store.getState().dataSource).toBe('github');
  });
});
