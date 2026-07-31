import type { DataSource } from '@/domain/entities/data-source';

import { primaryByDataSource } from '../tokens/brand-primary';
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

export type AppTheme = {
  mode: ThemeMode;
  dataSource: DataSource;
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  sizes: typeof sizes;
  radius: typeof radius;
  typography: typeof typography;
  icon: typeof icon;
  loading: typeof loading;
  button: typeof button;
  input: typeof input;
  card: typeof card;
};

const DEFAULT_DATA_SOURCE: DataSource = 'github';

export function getTheme(mode: ThemeMode, dataSource: DataSource = DEFAULT_DATA_SOURCE): AppTheme {
  const resolvedSource = dataSource ?? DEFAULT_DATA_SOURCE;

  return {
    mode,
    dataSource: resolvedSource,
    colors: {
      ...colors[mode],
      primary: primaryByDataSource[resolvedSource][mode],
    },
    spacing,
    sizes,
    radius,
    typography,
    icon,
    loading,
    button,
    input,
    card,
  };
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
