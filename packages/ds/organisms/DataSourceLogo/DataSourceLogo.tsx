import type { DataSource } from '@/application';
import type { Size } from '@/components/ds/tokens';
import { useAppTheme, useTheme } from '@/components/ds/theme';

import { logoComponentMap, resolveLogoAsset, StyledLogo } from './styles';

export type DataSourceLogoProps = {
  /** Overrides theme context data source when provided. */
  dataSource?: DataSource;
  size?: Size;
};

export function DataSourceLogo({ dataSource: dataSourceProp, size = 'md' }: DataSourceLogoProps) {
  const { dataSource: contextDataSource } = useAppTheme();
  const theme = useTheme();
  const dataSource = dataSourceProp ?? contextDataSource;
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
