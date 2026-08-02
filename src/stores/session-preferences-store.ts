import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isDataSource, type DataSource } from '@/application';
import type { ThemeMode } from '@/components/ds/theme/theme';
import type { ProviderTokens } from '@/infrastructure/di/create-container';
import {
  clearProviderTokens,
  loadProviderTokens,
  saveProviderToken,
} from '@/infrastructure/secure-store/provider-tokens-secure-store';

export const SESSION_PREFERENCES_STORAGE_KEY = 'searchrepos:session-preferences';

export type ProviderTokensSecureStorePort = {
  loadProviderTokens: () => Promise<ProviderTokens>;
  saveProviderToken: (dataSource: DataSource, token: string | undefined) => Promise<void>;
  clearProviderTokens: () => Promise<void>;
};

export type SessionPreferencesState = {
  mode: ThemeMode;
  dataSource: DataSource;
  /** In-memory API tokens bag — never AsyncStorage-persisted. */
  tokens: ProviderTokens;
  /** True after persist rehydrate finishes (success or storage error). Not persisted. */
  hasHydrated: boolean;
  /** True after SecureStore token hydrate finishes (success or empty fallback). Not persisted. */
  hasTokensHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setDataSource: (dataSource: DataSource) => void;
  toggleDataSource: () => void;
  setToken: (dataSource: DataSource, token: string | undefined) => void;
  setTokens: (tokens: ProviderTokens) => void;
  hydrateTokensFromSecureStore: () => Promise<void>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setHasTokensHydrated: (hasTokensHydrated: boolean) => void;
  /** Restores defaults in memory and clears the persist storage key + SecureStore tokens. */
  reset: () => void;
};

type PersistedSlice = Pick<SessionPreferencesState, 'mode' | 'dataSource'>;

export function systemThemeMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/** Returns null when persisted payload is missing or has invalid enums (→ system fallback). */
export function sanitizePersistedPreferences(raw: unknown): PersistedSlice | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as Record<string, unknown>;
  if (!isThemeMode(record.mode) || !isDataSource(record.dataSource)) {
    return null;
  }
  return { mode: record.mode, dataSource: record.dataSource };
}

const defaultSecureStore: ProviderTokensSecureStorePort = {
  loadProviderTokens,
  saveProviderToken,
  clearProviderTokens,
};

export type CreateSessionPreferencesStoreOptions = {
  storage?: StateStorage;
  secureStore?: ProviderTokensSecureStorePort;
};

export function createSessionPreferencesStore(options: CreateSessionPreferencesStoreOptions = {}) {
  let clearPersisted: () => void = () => {};
  let markHydrated: () => void = () => {};
  const secureStore = options.secureStore ?? defaultSecureStore;

  const store = create<SessionPreferencesState>()(
    persist(
      (set) => ({
        mode: systemThemeMode(),
        dataSource: 'github',
        tokens: {},
        hasHydrated: false,
        hasTokensHydrated: false,
        setMode: (mode) => set({ mode }),
        toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
        setDataSource: (dataSource) => set({ dataSource }),
        toggleDataSource: () =>
          set((state) => ({
            dataSource: state.dataSource === 'github' ? 'gitlab' : 'github',
          })),
        setToken: (dataSource, token) => {
          set((state) => {
            const next: ProviderTokens = { ...state.tokens };
            if (token === undefined || token === '') {
              delete next[dataSource];
            } else {
              next[dataSource] = token;
            }
            return { tokens: next };
          });
          void secureStore.saveProviderToken(dataSource, token);
        },
        setTokens: (tokens) => {
          const next: ProviderTokens = { ...tokens };
          set({ tokens: next });
          void secureStore.saveProviderToken('github', next.github);
          void secureStore.saveProviderToken('gitlab', next.gitlab);
        },
        hydrateTokensFromSecureStore: async () => {
          try {
            const loaded = await secureStore.loadProviderTokens();
            set({ tokens: { ...loaded }, hasTokensHydrated: true });
          } catch {
            set({ tokens: {}, hasTokensHydrated: true });
          }
        },
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        setHasTokensHydrated: (hasTokensHydrated) => set({ hasTokensHydrated }),
        reset: () => {
          set({ mode: systemThemeMode(), dataSource: 'github', tokens: {} });
          clearPersisted();
          void secureStore.clearProviderTokens();
        },
      }),
      {
        name: SESSION_PREFERENCES_STORAGE_KEY,
        storage: createJSONStorage(() => options.storage ?? AsyncStorage),
        partialize: (state) => ({
          mode: state.mode,
          dataSource: state.dataSource,
        }),
        merge: (persistedState, currentState) => {
          const sanitized = sanitizePersistedPreferences(persistedState);
          if (!sanitized) {
            return {
              ...currentState,
              mode: systemThemeMode(),
              dataSource: 'github',
            };
          }
          return {
            ...currentState,
            ...sanitized,
          };
        },
        onRehydrateStorage: () => () => {
          // Always mark ready — success or storage read/parse failure (TPH-04 / splash gate).
          markHydrated();
        },
      },
    ),
  );

  clearPersisted = () => {
    store.persist.clearStorage();
  };
  markHydrated = () => {
    store.setState({ hasHydrated: true });
  };

  return store;
}

export const useSessionPreferencesStore = createSessionPreferencesStore();
