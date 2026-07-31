import { View } from 'react-native';
import { css, styled } from 'styled-components/native';

export const StyledCard = styled(View)`
  ${({ theme }) => {
    const chrome = theme.card;
    return css`
      background-color: ${theme.colors[chrome.surfaceTone]};
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
