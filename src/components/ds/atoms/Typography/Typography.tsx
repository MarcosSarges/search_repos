import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import styled from 'styled-components/native';

import type { Size } from '@/components/ds/tokens';

type TypographyVariant = 'body' | 'label' | 'caption' | 'heading';
type TypographyTone = 'default' | 'muted' | 'primary' | 'danger';

export type TypographyProps = Omit<RNTextProps, 'style'> & {
  variant?: TypographyVariant;
  size?: Size;
  tone?: TypographyTone;
};

const StyledTypography = styled(RNText)<{
  $variant: TypographyVariant;
  $size: Size;
  $tone: TypographyTone;
}>`
  font-size: ${({ theme, $size, $variant }) =>
    $variant === 'heading' ? theme.sizes.xl : theme.sizes[$size]}px;
  color: ${({ theme, $tone }) => {
    switch ($tone) {
      case 'muted':
        return theme.colors.muted;
      case 'primary':
        return theme.colors.primary;
      case 'danger':
        return theme.colors.danger;
      default:
        return theme.colors.text;
    }
  }};
  font-weight: ${({ $variant }) =>
    $variant === 'label' || $variant === 'heading' ? '600' : '400'};
  line-height: ${({ $variant }) => {
    switch ($variant) {
      case 'caption':
        return 18;
      case 'heading':
        return 34;
      default:
        return 22;
    }
  }}px;
`;

export function Typography({
  variant = 'body',
  size = 'md',
  tone = 'default',
  children,
  ...rest
}: TypographyProps) {
  return (
    <StyledTypography $variant={variant} $size={size} $tone={tone} {...rest}>
      {children}
    </StyledTypography>
  );
}
