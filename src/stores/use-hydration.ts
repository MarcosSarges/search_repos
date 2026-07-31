import { useEffect, useState } from 'react';

import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

/**
 * React-friendly hydration flag for Zustand persist.
 * Once hydrated, stays true (does not flicker false on later subscribe).
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => useSessionPreferencesStore.persist.hasHydrated());

  useEffect(() => {
    setHydrated(useSessionPreferencesStore.persist.hasHydrated());
    const unsubFinish = useSessionPreferencesStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsubFinish;
  }, []);

  return hydrated;
}
