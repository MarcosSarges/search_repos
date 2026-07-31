import type { DataSource } from '@/domain/entities/data-source';

type BrandThemeMode = 'light' | 'dark';

/**
 * Official brand primary hexes by data source × theme mode.
 * GitHub: brand.github.com/foundations/color
 * GitLab: design.gitlab.com/brand-design/color
 */
export const primaryByDataSource: Record<DataSource, Record<BrandThemeMode, string>> = {
  github: {
    light: '#0FBF3E',
    dark: '#5FED83',
  },
  gitlab: {
    light: '#FC6D26',
    dark: '#FCA326',
  },
};

export type PrimaryBrandMap = typeof primaryByDataSource;
