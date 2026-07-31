import type { StateStorage } from 'zustand/middleware';

/** In-memory StateStorage for Zustand persist tests (no native AsyncStorage). */
export function createMemoryStorage(): StateStorage {
  const map = new Map<string, string>();

  return {
    getItem: (name) => map.get(name) ?? null,
    setItem: (name, value) => {
      map.set(name, value);
    },
    removeItem: (name) => {
      map.delete(name);
    },
  };
}
