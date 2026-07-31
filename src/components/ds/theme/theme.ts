import type { DataSource } from '@/domain/entities/data-source';

import { primaryByDataSource } from '../tokens/brand-primary';
import { colors, type ColorToken } from '../tokens/colors';
import { radius } from '../tokens/radius';
import { sizes } from '../tokens/sizes';
import { spacing } from '../tokens/spacing';

export type ThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  dataSource: DataSource;
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  sizes: typeof sizes;
  radius: typeof radius;
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
  };
}

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
