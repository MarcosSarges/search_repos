import { Appearance } from 'react-native';

import { createMemoryStorage } from '@/test/memory-storage';

import {
  createSessionPreferencesStore,
  sanitizePersistedPreferences,
  SESSION_PREFERENCES_STORAGE_KEY,
  systemThemeMode,
  type ProviderTokensSecureStorePort,
} from '../session-preferences-store';

function createFakeSecureStore(
  initial: { github?: string; gitlab?: string } = {},
): ProviderTokensSecureStorePort & {
  bag: { github?: string; gitlab?: string };
  saveCalls: Array<{ dataSource: string; token: string | undefined }>;
  clearCalls: number;
} {
  const bag = { ...initial };
  const saveCalls: Array<{ dataSource: string; token: string | undefined }> = [];
  let clearCalls = 0;

  return {
    bag,
    saveCalls,
    get clearCalls() {
      return clearCalls;
    },
    loadProviderTokens: async () => ({ ...bag }),
    saveProviderToken: async (dataSource, token) => {
      saveCalls.push({ dataSource, token });
      if (token === undefined || token === '') {
        delete bag[dataSource];
      } else {
        bag[dataSource] = token;
      }
    },
    clearProviderTokens: async () => {
      clearCalls += 1;
      delete bag.github;
      delete bag.gitlab;
    },
  };
}

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

  it('WHEN storage has corrupt JSON THEN mode falls back to system scheme and dataSource is github', async () => {
    const memory = createMemoryStorage();
    await memory.setItem(SESSION_PREFERENCES_STORAGE_KEY, '{not-valid-json');

    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('dark');
    const store = createSessionPreferencesStore({ storage: memory });
    await store.persist.rehydrate();

    expect(store.getState().mode).toBe('dark');
    expect(store.getState().dataSource).toBe('github');
  });

  it('WHEN storage getItem throws THEN store still becomes ready with system mode and github', async () => {
    const failingStorage = {
      getItem: async () => {
        throw new Error('read failed');
      },
      setItem: async () => undefined,
      removeItem: async () => undefined,
    };

    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const store = createSessionPreferencesStore({ storage: failingStorage });
    await store.persist.rehydrate();

    expect(store.getState().mode).toBe('light');
    expect(store.getState().dataSource).toBe('github');
    expect(store.getState().hasHydrated).toBe(true);
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

/**
 * PRES-05b–05g: tokens slot, SecureStore write-through, partialize exclusion, hydrate, reset.
 */
describe('session-preferences tokens (PRES-05b–05g)', () => {
  beforeEach(() => {
    jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('WHEN store is created THEN tokens default to {} and hasTokensHydrated is false', () => {
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore: createFakeSecureStore(),
    });

    expect(store.getState().tokens).toEqual({});
    expect(store.getState().hasTokensHydrated).toBe(false);
    expect(typeof store.getState().setToken).toBe('function');
    expect(typeof store.getState().setTokens).toBe('function');
    expect(typeof store.getState().hydrateTokensFromSecureStore).toBe('function');
  });

  it('WHEN setToken updates a value THEN memory updates with a new tokens reference and SecureStore is written', async () => {
    const secureStore = createFakeSecureStore();
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore,
    });
    const before = store.getState().tokens;

    store.getState().setToken('github', 'gh-secret');
    await Promise.resolve();

    const after = store.getState().tokens;
    expect(after).toEqual({ github: 'gh-secret' });
    expect(after).not.toBe(before);
    expect(secureStore.saveCalls).toEqual([{ dataSource: 'github', token: 'gh-secret' }]);
    expect(secureStore.bag.github).toBe('gh-secret');
  });

  it('WHEN setTokens runs THEN memory gets a new object and each source is write-through persisted', async () => {
    const secureStore = createFakeSecureStore();
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore,
    });
    const payload = { github: 'a', gitlab: 'b' };

    store.getState().setTokens(payload);
    await Promise.resolve();

    expect(store.getState().tokens).toEqual(payload);
    expect(store.getState().tokens).not.toBe(payload);
    expect(secureStore.saveCalls).toEqual(
      expect.arrayContaining([
        { dataSource: 'github', token: 'a' },
        { dataSource: 'gitlab', token: 'b' },
      ]),
    );
  });

  it('WHEN setToken clears a token THEN SecureStore delete is invoked and key is removed from memory', async () => {
    const secureStore = createFakeSecureStore({ github: 'old' });
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore,
    });
    store.setState({ tokens: { github: 'old' } });

    store.getState().setToken('github', undefined);
    await Promise.resolve();

    expect(store.getState().tokens).toEqual({});
    expect(secureStore.saveCalls.at(-1)).toEqual({ dataSource: 'github', token: undefined });
    expect(secureStore.bag.github).toBeUndefined();
  });

  it('WHEN partialize runs THEN only mode and dataSource are persisted — tokens never touch AsyncStorage', async () => {
    const memory = createMemoryStorage();
    const store = createSessionPreferencesStore({
      storage: memory,
      secureStore: createFakeSecureStore(),
    });

    store.getState().setMode('dark');
    store.getState().setDataSource('gitlab');
    store.getState().setToken('github', 'must-not-persist');
    await Promise.resolve();

    const raw = await memory.getItem(SESSION_PREFERENCES_STORAGE_KEY);
    const parsed = JSON.parse(String(raw)) as { state: Record<string, unknown> };
    expect(parsed.state).toEqual({ mode: 'dark', dataSource: 'gitlab' });
    expect(parsed.state).not.toHaveProperty('tokens');
    expect(JSON.stringify(parsed)).not.toContain('must-not-persist');
  });

  it('WHEN hydrateTokensFromSecureStore runs THEN tokens restore into memory without re-writing SecureStore', async () => {
    const secureStore = createFakeSecureStore({ github: 'restored', gitlab: 'gl' });
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore,
    });

    await store.getState().hydrateTokensFromSecureStore();

    expect(store.getState().tokens).toEqual({ github: 'restored', gitlab: 'gl' });
    expect(store.getState().hasTokensHydrated).toBe(true);
    expect(secureStore.saveCalls).toEqual([]);
  });

  it('WHEN SecureStore is unavailable (empty load) THEN hydrate leaves empty tokens and still marks ready', async () => {
    const secureStore = createFakeSecureStore();
    secureStore.loadProviderTokens = async () => ({});
    const store = createSessionPreferencesStore({
      storage: createMemoryStorage(),
      secureStore,
    });

    await store.getState().hydrateTokensFromSecureStore();

    expect(store.getState().tokens).toEqual({});
    expect(store.getState().hasTokensHydrated).toBe(true);
  });

  it('WHEN reset runs THEN in-memory tokens clear and SecureStore entries are cleared', async () => {
    const secureStore = createFakeSecureStore({ github: 'x', gitlab: 'y' });
    const memory = createMemoryStorage();
    const store = createSessionPreferencesStore({ storage: memory, secureStore });

    store.getState().setToken('github', 'x');
    store.getState().setDataSource('gitlab');
    await Promise.resolve();

    store.getState().reset();
    await Promise.resolve();

    expect(store.getState().tokens).toEqual({});
    expect(store.getState().dataSource).toBe('github');
    expect(secureStore.clearCalls).toBe(1);
    expect(secureStore.bag).toEqual({});
    expect(await memory.getItem(SESSION_PREFERENCES_STORAGE_KEY)).toBeNull();
  });
});
