export type Brand = 'github' | 'gitlab';

type BrandThemeMode = 'light' | 'dark';

/**
 * Official brand primary hexes by brand × theme mode.
 * GitHub: brand.github.com/foundations/color
 * GitLab: design.gitlab.com/brand-design/color
 */
export const primaryByBrand: Record<Brand, Record<BrandThemeMode, string>> = {
  github: {
    light: '#0FBF3E',
    dark: '#5FED83',
  },
  gitlab: {
    light: '#FC6D26',
    dark: '#FCA326',
  },
};

export type PrimaryBrandMap = typeof primaryByBrand;
