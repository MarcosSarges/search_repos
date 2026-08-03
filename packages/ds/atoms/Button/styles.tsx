import { Pressable, Text } from 'react-native';
import { css, styled } from 'styled-components/native';

import type { ButtonSize, ButtonVariant } from '@/components/ds/tokens';
import type { AppTheme } from '@/components/ds/theme';

type ButtonChrome = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  labelColor: string;
};

const buttonVariantChrome = {
  primary: (colors: AppTheme['colors']): ButtonChrome => ({
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 1,
    labelColor: colors.background,
  }),
  outline: (colors: AppTheme['colors']): ButtonChrome => ({
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1,
    labelColor: colors.primary,
  }),
  ghost: (colors: AppTheme['colors']): ButtonChrome => ({
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    labelColor: colors.primary,
  }),
} as const satisfies Record<ButtonVariant, (colors: AppTheme['colors']) => ButtonChrome>;

export const StyledButton = styled(Pressable)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $disabled: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${({ theme, $size }) => {
    const sizeToken = theme.button[$size];
    return css`
      padding-top: ${sizeToken.paddingVertical}px;
      padding-bottom: ${sizeToken.paddingVertical}px;
      padding-left: ${sizeToken.paddingHorizontal}px;
      padding-right: ${sizeToken.paddingHorizontal}px;
      min-height: ${sizeToken.minHeight}px;
    `;
  }}
  ${({ theme, $variant }) => {
    const chrome = buttonVariantChrome[$variant](theme.colors);
    return css`
      background-color: ${chrome.backgroundColor};
      border-color: ${chrome.borderColor};
      border-width: ${chrome.borderWidth}px;
      border-radius: ${theme.radius.md}px;
    `;
  }}
  ${({ $disabled }) =>
    $disabled
      ? css`
          opacity: 0.5;
        `
      : css``}
`;

export const ContentRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const ButtonLabel = styled(Text)<{ $variant: ButtonVariant }>`
  font-family: ${({ theme }) => theme.typography.label.fontFamily};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  color: ${({ theme, $variant }) => buttonVariantChrome[$variant](theme.colors).labelColor};
`;
