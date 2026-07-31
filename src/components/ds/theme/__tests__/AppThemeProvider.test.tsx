import { act, renderHook } from '@/test';
import { useAppTheme } from '../AppThemeProvider';

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
});
