import { Text, View } from 'react-native';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  waitFor,
} from '@testing-library/react-native';

import { AppThemeProvider } from '@/presentation/theme';
import { act, render, screen } from '@/test';
import { useSessionPreferencesStore } from '@/presentation/stores/session-preferences-store';
import { useHydration } from '@/presentation/stores/use-hydration';

/**
 * PRES-05e / PRES-05f: product UI waits for prefs + tokens hydrate.
 */
describe('session gate (prefs + tokens)', () => {
  it('WHEN only prefs have hydrated THEN useHydration is false', async () => {
    useSessionPreferencesStore.setState({
      hasHydrated: true,
      hasTokensHydrated: false,
    });

    const { result } = await rtlRenderHook(() => useHydration());
    expect(result.current).toBe(false);
  });

  it('WHEN only tokens have hydrated THEN useHydration is false', async () => {
    useSessionPreferencesStore.setState({
      hasHydrated: false,
      hasTokensHydrated: true,
    });

    const { result } = await rtlRenderHook(() => useHydration());
    expect(result.current).toBe(false);
  });

  it('WHEN both prefs and tokens have hydrated THEN useHydration is true', async () => {
    useSessionPreferencesStore.setState({
      hasHydrated: true,
      hasTokensHydrated: true,
    });

    const { result } = await rtlRenderHook(() => useHydration());
    expect(result.current).toBe(true);
  });

  it('WHEN provider mounts THEN it triggers tokens SecureStore hydrate at boot', async () => {
    const hydrate = jest.fn(async () => {
      await act(async () => {
        useSessionPreferencesStore.setState({ hasTokensHydrated: true, tokens: {} });
      });
    });
    useSessionPreferencesStore.setState({
      hasHydrated: true,
      hasTokensHydrated: false,
      hydrateTokensFromSecureStore: hydrate,
    });

    const view = await rtlRender(
      <AppThemeProvider>
        <View testID="child" />
      </AppThemeProvider>,
    );

    await waitFor(() => {
      expect(hydrate).toHaveBeenCalledTimes(1);
    });
    view.unmount();
  });

  it('WHEN SecureStore hydrate completes empty THEN provider still paints children', async () => {
    useSessionPreferencesStore.setState({
      hasHydrated: false,
      hasTokensHydrated: false,
      hydrateTokensFromSecureStore: async () => {
        await act(async () => {
          useSessionPreferencesStore.setState({ tokens: {}, hasTokensHydrated: true });
        });
      },
    });

    const view = await rtlRender(
      <AppThemeProvider>
        <View testID="product-after-empty">
          <Text>Ready</Text>
        </View>
      </AppThemeProvider>,
    );

    await act(async () => {
      useSessionPreferencesStore.getState().setHasHydrated(true);
    });

    await waitFor(() => {
      expect(view.getByTestId('product-after-empty')).toBeTruthy();
    });
    view.unmount();
  });

  it('WHEN prefs ready but tokens not THEN provider blocks children', async () => {
    useSessionPreferencesStore.setState({
      hasHydrated: true,
      hasTokensHydrated: false,
      hydrateTokensFromSecureStore: async () => {
        /* leave tokens not ready — simulates in-flight hydrate */
      },
    });

    const view = await rtlRender(
      <AppThemeProvider>
        <View testID="blocked-child" />
      </AppThemeProvider>,
    );

    expect(view.queryByTestId('blocked-child')).toBeNull();
    view.unmount();
  });

  it('WHEN both ready via harness THEN provider paints children', async () => {
    await render(
      <View testID="product-child">
        <Text>Hello</Text>
      </View>,
    );

    expect(screen.getByTestId('product-child')).toBeTruthy();
  });
});
