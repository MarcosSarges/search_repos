import { avatar } from '../tokens/avatar';
import { badge } from '../tokens/badge';
import { primaryByBrand, type Brand } from '../tokens/brand-primary';
import { button } from '../tokens/button';
import { card } from '../tokens/card';
import { colors, type ColorToken } from '../tokens/colors';
import { icon } from '../tokens/icon';
import { input } from '../tokens/input';
import { loading } from '../tokens/loading';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { spacing } from '../tokens/spacing';
import { typography } from '../tokens/typography';

export type ThemeMode = 'light' | 'dark';
export type { Brand };

export type AppTheme = {
  mode: ThemeMode;
  brand: Brand;
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  sizes: typeof sizes;
  radius: typeof radius;
  typography: typeof typography;
  icon: typeof icon;
  avatar: typeof avatar;
  badge: typeof badge;
  loading: typeof loading;
  button: typeof button;
  input: typeof input;
  card: typeof card;
};

const DEFAULT_BRAND: Brand = 'github';

export function getTheme(mode: ThemeMode, brand: Brand = DEFAULT_BRAND): AppTheme {
  const resolvedBrand = brand ?? DEFAULT_BRAND;

  return {
    mode,
    brand: resolvedBrand,
    colors: {
      ...colors[mode],
      primary: primaryByBrand[resolvedBrand][mode],
    },
    spacing,
    sizes,
    radius,
    typography,
    icon,
    avatar,
    badge,
    loading,
    button,
    input,
    card,
  };
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
