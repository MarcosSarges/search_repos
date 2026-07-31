import type { DataSource } from '@/domain/entities/data-source';
import type { Size } from '@/components/ds/tokens';
import { sizes } from '@/components/ds/tokens';
import { useAppTheme, useTheme, type ThemeMode } from '@/components/ds/theme';

import GitHubInvertocatBlack from '@/assets/github/GitHub_Invertocat_Black.svg';
import GitHubInvertocatWhite from '@/assets/github/GitHub_Invertocat_White_Clearspace.svg';
import GitLabLogo from '@/assets/gitlab/gitlab-logo-500-rgb.svg';

export type DataSourceLogoProps = {
  /** Overrides theme context data source when provided. */
  dataSource?: DataSource;
  size?: Size;
};

type LogoAsset = 'github-black' | 'github-white' | 'gitlab';

function resolveLogoAsset(dataSource: DataSource, mode: ThemeMode): LogoAsset {
  if (dataSource === 'gitlab') {
    return 'gitlab';
  }
  return mode === 'dark' ? 'github-white' : 'github-black';
}

export function DataSourceLogo({ dataSource: dataSourceProp, size = 'md' }: DataSourceLogoProps) {
  const { dataSource: contextDataSource } = useAppTheme();
  const theme = useTheme();
  const dataSource = dataSourceProp ?? contextDataSource;
  const asset = resolveLogoAsset(dataSource, theme.mode);
  const dimension = sizes[size];
  const testID = `ds-datasource-logo-${asset}` as const;

  const shared = {
    width: dimension,
    height: dimension,
    testID,
    accessibilityRole: 'image' as const,
    accessibilityLabel: dataSource === 'gitlab' ? 'GitLab logo' : 'GitHub logo',
  };

  switch (asset) {
    case 'github-black':
      return <GitHubInvertocatBlack {...shared} />;
    case 'github-white':
      return <GitHubInvertocatWhite {...shared} />;
    case 'gitlab':
      return <GitLabLogo {...shared} />;
  }
}
