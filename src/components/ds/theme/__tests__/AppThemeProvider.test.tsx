import { useEffect } from 'react';
import { act, renderHook } from '@/test';
import { useAppTheme, useTheme } from '../';

describe('AppThemeProvider dataSource (DS-02)', () => {
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
});
