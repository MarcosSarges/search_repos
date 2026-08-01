import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

export function useHydration(): boolean {
  return useSessionPreferencesStore((state) => state.hasHydrated);
}
