import { renderHook } from '@testing-library/react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(),
}));

const mockUseColorScheme = jest.mocked(useColorScheme);

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the light color from props', async () => {
    mockUseColorScheme.mockReturnValue('light');

    const { result } = await renderHook(() =>
      useThemeColor({ light: 'red', dark: 'blue' }, 'text'),
    );

    expect(result.current).toBe('red');
  });

  it('should return the dark color from props', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { result } = await renderHook(() =>
      useThemeColor({ light: 'red', dark: 'blue' }, 'text'),
    );

    expect(result.current).toBe('blue');
  });
});
