import { View } from 'react-native';
import { css, styled } from 'styled-components/native';

const SWATCH_ALPHA = '33'; // ~0.2 opacity on 8-digit hex

export const BadgeRoot = styled(View)<{ $swatch?: string }>`
  align-self: flex-start;
  flex-direction: row;
  align-items: center;
  padding-vertical: ${({ theme }) => theme.badge.paddingVertical}px;
  padding-horizontal: ${({ theme }) => theme.badge.paddingHorizontal}px;
  border-radius: ${({ theme }) => theme.badge.radius}px;
  border-width: 1px;

  ${({ theme, $swatch }) =>
    $swatch
      ? css`
          background-color: ${$swatch}${SWATCH_ALPHA};
          border-color: ${$swatch};
        `
      : css`
          background-color: ${theme.colors.surface};
          border-color: ${theme.colors.border};
        `}
`;
