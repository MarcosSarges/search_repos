import { useEffect } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Text, View } from 'react-native';
import { render as rtlRender, waitFor } from '@testing-library/react-native';

import { act, render, renderHook, screen } from '@/test';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';

import { AppThemeProvider, useAppTheme, useTheme } from '../';

describe('AppThemeProvider dataSource (DS-02 / TPH-05..06)', () => {
  it('WHEN provider mounts without initialDataSource THEN dataSource defaults to github', async () => {
    const { result } = await renderHook(() => useAppTheme());
    expect(result.current.dataSource).toBe('github');
  });

  it('WHEN setDataSource is called THEN dataSource updates', async () => {
    const { result } = await renderHook(() => useAppTheme());

    await act(async () => {
      result.current.setDataSource('gitlab');
    });

    expect(result.current.dataSource).toBe('gitlab');
  });

  it('WHEN setMode is called THEN mode updates', async () => {
    const { result } = await renderHook(() => useAppTheme());

    await act(async () => {
      result.current.setMode('dark');
    });

    expect(result.current.mode).toBe('dark');
  });

  it('WHEN setDataSource changes at runtime THEN theme.colors.primary updates without remounting', async () => {
    let mountCount = 0;

    const { result } = await renderHook(
      () => {
        useEffect(() => {
          mountCount += 1;
        }, []);

        return {
          app: useAppTheme(),
          primary: useTheme().colors.primary,
        };
      },
      { themeMode: 'light' },
    );

    expect(result.current.primary).toBe('#0FBF3E');
    expect(mountCount).toBe(1);

    await act(async () => {
      result.current.app.setDataSource('gitlab');
    });

    expect(result.current.app.dataSource).toBe('gitlab');
    expect(result.current.primary).toBe('#FC6D26');
    expect(mountCount).toBe(1);
  });

  it('WHEN setMode changes at runtime THEN theme.colors.primary updates for github dark without remounting', async () => {
    let mountCount = 0;

    const { result } = await renderHook(
      () => {
        useEffect(() => {
          mountCount += 1;
        }, []);

        return {
          app: useAppTheme(),
          primary: useTheme().colors.primary,
        };
      },
      { themeMode: 'light' },
    );

    expect(result.current.primary).toBe('#0FBF3E');
    expect(mountCount).toBe(1);

    await act(async () => {
      result.current.app.setMode('dark');
    });

    expect(result.current.app.mode).toBe('dark');
    expect(result.current.primary).toBe('#5FED83');
    expect(mountCount).toBe(1);
  });

  it('WHEN gitlab + dark via provider API THEN theme.colors.primary is #FCA326', async () => {
    const { result } = await renderHook(
      () => ({
        app: useAppTheme(),
        primary: useTheme().colors.primary,
      }),
      { themeMode: 'light' },
    );

    await act(async () => {
      result.current.app.setDataSource('gitlab');
      result.current.app.setMode('dark');
    });

    expect(result.current.primary).toBe('#FCA326');
  });

  it('WHEN session store is the source of truth THEN provider has no parallel useState for prefs', () => {
    const source = readFileSync(join(__dirname, '../AppThemeProvider.tsx'), 'utf8');
    expect(source).not.toMatch(/useState<\s*ThemeMode/);
    expect(source).not.toMatch(/useState<\s*DataSource/);
    expect(source).toMatch(/useSessionPreferencesStore/);
  });

  it('WHEN provider source is inspected THEN it returns null until hydrated', () => {
    const source = readFileSync(join(__dirname, '../AppThemeProvider.tsx'), 'utf8');
    expect(source).toMatch(/useHydration/);
    expect(source).toMatch(/if \(!hydrated\)/);
    expect(source).toMatch(/return null/);
  });

  it('WHEN store has hydrated THEN provider paints children', async () => {
    await waitFor(() => {
      expect(useSessionPreferencesStore.persist.hasHydrated()).toBe(true);
    });

    await render(
      <View testID="product-child">
        <Text>Hello</Text>
      </View>,
    );

    expect(screen.getByTestId('product-child')).toBeTruthy();
  });
});
