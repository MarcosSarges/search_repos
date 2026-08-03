import { StyleSheet, View } from 'react-native';
import { css, styled } from 'styled-components/native';

export const StyledHeader = styled(View)<{ safeTop: number | null }>`
  background-color: ${({ theme }) => theme.colors.background};
  flex-direction: row;
  align-items: center;
  border-bottom-width: ${StyleSheet.hairlineWidth}px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
  elevation: 2;
  ${({ theme }) => css`
    shadow-color: ${theme.colors.shadow};
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
  `}

  ${({ safeTop }) =>
    safeTop
      ? css`
          padding-top: ${safeTop}px;
        `
      : css``};
`;

export const HeaderTitleSlot = styled(View)`
  flex: 1;
`;
