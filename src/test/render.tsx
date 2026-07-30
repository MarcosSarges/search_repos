import { type ReactElement, type ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  type RenderHookOptions,
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react-native';

import { AppThemeProvider, type ThemeMode } from '@/components/ds';

type ProvidersProps = {
  children: ReactNode;
  themeMode?: ThemeMode;
};

const initialSafeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function AllTheProviders({ children, themeMode = 'light' }: ProvidersProps) {
  return (
    <SafeAreaProvider initialMetrics={initialSafeAreaMetrics}>
      <AppThemeProvider initialMode={themeMode}>{children}</AppThemeProvider>
    </SafeAreaProvider>
  );
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  themeMode?: ThemeMode;
};

export async function render(
  ui: ReactElement,
  { themeMode = 'light', ...options }: CustomRenderOptions = {},
): Promise<RenderResult> {
  return rtlRender(ui, {
    ...options,
    wrapper: ({ children }) => <AllTheProviders themeMode={themeMode}>{children}</AllTheProviders>,
  });
}

type CustomRenderHookOptions<Props> = Omit<RenderHookOptions<Props>, 'wrapper'> & {
  themeMode?: ThemeMode;
};

export async function renderHook<Result, Props>(
  callback: (props: Props) => Result,
  { themeMode = 'light', ...options }: CustomRenderHookOptions<Props> = {},
): Promise<RenderHookResult<Result, Props>> {
  return rtlRenderHook(callback, {
    ...options,
    wrapper: ({ children }) => <AllTheProviders themeMode={themeMode}>{children}</AllTheProviders>,
  });
}

export { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react-native';
