import { View } from 'react-native';
import type { SurfaceBg } from '@ds/tokens';
import { css, styled } from 'styled-components/native';

export const StyledCard = styled(View)<{ $bg: SurfaceBg }>`
  ${({ theme, $bg }) => {
    const chrome = theme.card;
    return css`
      background-color: ${theme.colors[$bg]};
      border-radius: ${theme.radius[chrome.radius]}px;
      border-width: 1px;
      border-color: ${theme.colors[chrome.borderColorToken]};
      overflow: hidden;
    `;
  }}
`;

export const CardRegion = styled(View)`
  padding: ${({ theme }) => theme.spacing.md}px;
`;
