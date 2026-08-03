import type { DataSource } from '@/application';
import type { Size } from '@ds/tokens';
import { useTheme } from '@ds/theme';

import { logoComponentMap, resolveLogoAsset, StyledLogo } from './styles';

export type DataSourceLogoProps = {
  /** Overrides theme context brand when provided (same union as Brand until T7 rename). */
  dataSource?: DataSource;
  size?: Size;
};

export function DataSourceLogo({ dataSource: dataSourceProp, size = 'md' }: DataSourceLogoProps) {
  const theme = useTheme();
  const dataSource = dataSourceProp ?? theme.brand;
  const asset = resolveLogoAsset(dataSource, theme.mode);
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
        accessibilityLabel={dataSource === 'gitlab' ? 'GitLab logo' : 'GitHub logo'}
      />
    </StyledLogo>
  );
}
