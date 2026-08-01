import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { DataSource } from '@/domain/entities/data-source';
import type { ThemeMode } from '@/components/ds/theme/theme';

export const SESSION_PREFERENCES_STORAGE_KEY = 'searchrepos:session-preferences';

export type SessionPreferencesState = {
  mode: ThemeMode;
  dataSource: DataSource;
  /** True after persist rehydrate finishes (success or storage error). Not persisted. */
  hasHydrated: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setDataSource: (dataSource: DataSource) => void;
  toggleDataSource: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  /** Restores defaults in memory and clears the persist storage key. */
  reset: () => void;
};

type PersistedSlice = Pick<SessionPreferencesState, 'mode' | 'dataSource'>;

export function systemThemeMode(): ThemeMode {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

function isDataSource(value: unknown): value is DataSource {
  return value === 'github' || value === 'gitlab';
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

export type CreateSessionPreferencesStoreOptions = {
  storage?: StateStorage;
};

export function createSessionPreferencesStore(options: CreateSessionPreferencesStoreOptions = {}) {
  let clearPersisted: () => void = () => {};
  let markHydrated: () => void = () => {};

  const store = create<SessionPreferencesState>()(
    persist(
      (set) => ({
        mode: systemThemeMode(),
        dataSource: 'github',
        hasHydrated: false,
        setMode: (mode) => set({ mode }),
        toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
        setDataSource: (dataSource) => set({ dataSource }),
        toggleDataSource: () =>
          set((state) => ({
            dataSource: state.dataSource === 'github' ? 'gitlab' : 'github',
          })),
        setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        reset: () => {
          set({ mode: systemThemeMode(), dataSource: 'github' });
          clearPersisted();
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
