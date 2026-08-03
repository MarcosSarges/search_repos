import type { Brand } from '@ds/theme';
import type { Size } from '@ds/tokens';
import { useTheme } from '@ds/theme';

import { logoComponentMap, resolveLogoAsset, StyledLogo } from './styles';

export type DataSourceLogoProps = {
  /** Overrides theme.brand when provided. */
  brand?: Brand;
  size?: Size;
};

export function DataSourceLogo({ brand: brandProp, size = 'md' }: DataSourceLogoProps) {
  const theme = useTheme();
  const brand = brandProp ?? theme.brand;
  const asset = resolveLogoAsset(brand, theme.mode);
  const Logo = logoComponentMap[asset];
  const dimension = theme.sizes[size];
  const testID = `ds-datasource-logo-${asset}` as const;

  return (
    <StyledLogo $size={size}>
      <Logo
        width={dimension}
        height={dimension}
        testID={testID}
        accessibilityRole="image"
        accessibilityLabel={brand === 'gitlab' ? 'GitLab logo' : 'GitHub logo'}
      />
    </StyledLogo>
  );
}
