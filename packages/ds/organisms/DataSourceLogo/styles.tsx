import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { styled } from 'styled-components/native';

import type { DataSource } from '@/application';
import type { Size } from '@/components/ds/tokens';
import type { ThemeMode } from '@/components/ds/theme';

import GitHubInvertocatBlack from '../../assets/github/GitHub_Invertocat_Black.svg';
import GitHubInvertocatWhite from '../../assets/github/GitHub_Invertocat_White_Clearspace.svg';
import GitLabLogo from '../../assets/gitlab/gitlab-logo-500-rgb.svg';

export type LogoAsset = 'github-black' | 'github-white' | 'gitlab';

type LogoKey = `${DataSource}:${ThemeMode}`;

const logoAssetBySourceMode = {
  'github:light': 'github-black',
  'github:dark': 'github-white',
  'gitlab:light': 'gitlab',
  'gitlab:dark': 'gitlab',
} as const satisfies Record<LogoKey, LogoAsset>;

export const logoComponentMap = {
  'github-black': GitHubInvertocatBlack,
  'github-white': GitHubInvertocatWhite,
  gitlab: GitLabLogo,
} as const satisfies Record<LogoAsset, ComponentType<SvgProps>>;

export function resolveLogoAsset(dataSource: DataSource, mode: ThemeMode): LogoAsset {
  return logoAssetBySourceMode[`${dataSource}:${mode}`];
}

export const StyledLogo = styled.View<{ $size: Size }>`
  width: ${({ theme, $size }) => theme.sizes[$size]}px;
  height: ${({ theme, $size }) => theme.sizes[$size]}px;
`;
