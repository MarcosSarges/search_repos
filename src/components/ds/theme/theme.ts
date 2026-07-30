import { colors, type ColorToken } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { spacing } from '../tokens/spacing';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  sizes: typeof sizes;
  radius: typeof radius;
};

export function getTheme(mode: ThemeMode): AppTheme {
  return {
    mode,
    colors: { ...colors[mode] },
    spacing,
    sizes,
    radius,
  };
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
