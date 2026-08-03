import { useSessionPreferencesStore } from '@/presentation/stores/session-preferences-store';

/**
 * Product UI ready only when prefs AsyncStorage hydrate AND tokens SecureStore
 * hydrate have finished (PRES-05e / PRES-05f).
 */
export function useHydration(): boolean {
  return useSessionPreferencesStore((state) => state.hasHydrated && state.hasTokensHydrated);
}
