import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

/** React-friendly hydration flag (Zustand FAQ + storage-error ready). */
export function useHydration(): boolean {
  return useSessionPreferencesStore((state) => state.hasHydrated);
}
