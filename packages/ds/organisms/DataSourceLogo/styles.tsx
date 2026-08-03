import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';
import { styled } from 'styled-components/native';

import type { Brand, ThemeMode } from '@ds/theme';
import type { Size } from '@ds/tokens';

import GitHubInvertocatBlack from '../../assets/github/GitHub_Invertocat_Black.svg';
import GitHubInvertocatWhite from '../../assets/github/GitHub_Invertocat_White_Clearspace.svg';
import GitLabLogo from '../../assets/gitlab/gitlab-logo-500-rgb.svg';

export type LogoAsset = 'github-black' | 'github-white' | 'gitlab';

type LogoKey = `${Brand}:${ThemeMode}`;

const logoAssetByBrandMode = {
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

export function resolveLogoAsset(brand: Brand, mode: ThemeMode): LogoAsset {
  return logoAssetByBrandMode[`${brand}:${mode}`];
}

export const StyledLogo = styled.View<{ $size: Size }>`
  width: ${({ theme, $size }) => theme.sizes[$size]}px;
  height: ${({ theme, $size }) => theme.sizes[$size]}px;
`;
