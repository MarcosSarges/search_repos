import type { DataSource } from '@/domain/entities/data-source';

import { primaryByDataSource } from '../tokens/brand-primary';
import { colors, type ColorToken } from '../tokens/colors';
import { icon } from '../tokens/icon';
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
  };
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
