import { type TextProps as RNTextProps } from 'react-native';

import type { Size, TypographyVariant } from '@/components/ds/tokens';

import { StyledTypography, type TypographyTone } from './styles';

export type TypographyProps = Omit<RNTextProps, 'style'> & {
  variant?: TypographyVariant;
  size?: Size;
  tone?: TypographyTone;
};

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
