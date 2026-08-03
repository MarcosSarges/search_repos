import { Pressable, Text } from 'react-native';
import { css, styled } from 'styled-components/native';

import type { ButtonColor, ButtonSize, ButtonVariant, ButtonWidth } from '@ds/tokens';
import type { AppTheme } from '@ds/theme';

type ButtonChrome = {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  labelColor: string;
};

const chromeByVariant = {
  contained: (palette: string, canvas: string): ButtonChrome => ({
    backgroundColor: palette,
    borderColor: palette,
    borderWidth: 1,
    labelColor: canvas,
  }),
  outlined: (palette: string): ButtonChrome => ({
    backgroundColor: 'transparent',
    borderColor: palette,
    borderWidth: 1,
    labelColor: palette,
  }),
  text: (palette: string): ButtonChrome => ({
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    labelColor: palette,
  }),
} as const;

function resolveChrome(
  variant: ButtonVariant,
  color: ButtonColor,
  colors: AppTheme['colors'],
): ButtonChrome {
  const palette = colors[color];
  if (variant === 'contained') {
    return chromeByVariant.contained(palette, colors.background);
  }
  if (variant === 'outlined') {
    return chromeByVariant.outlined(palette);
  }
  return chromeByVariant.text(palette);
}

const widthStyles = {
  full: css`
    align-self: stretch;
    width: 100%;
  `,
  hug: css`
    align-self: flex-start;
  `,
} as const satisfies Record<ButtonWidth, ReturnType<typeof css>>;

export const StyledButton = styled(Pressable)<{
  $variant: ButtonVariant;
  $color: ButtonColor;
  $size: ButtonSize;
  $width: ButtonWidth;
  $disabled: boolean;
}>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  ${({ $width }) => widthStyles[$width]}
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
  ${({ theme, $variant, $color }) => {
    const chrome = resolveChrome($variant, $color, theme.colors);
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

export const ButtonLabel = styled(Text)<{
  $variant: ButtonVariant;
  $color: ButtonColor;
}>`
  font-family: ${({ theme }) => theme.typography.label.fontFamily};
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.label.fontWeight};
  line-height: ${({ theme }) => theme.typography.label.lineHeight}px;
  color: ${({ theme, $variant, $color }) =>
    resolveChrome($variant, $color, theme.colors).labelColor};
`;
