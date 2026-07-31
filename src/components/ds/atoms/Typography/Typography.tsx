import { type TextProps as RNTextProps } from 'react-native';

import type { Tone, TypographyVariant } from '@/components/ds/tokens';

import { StyledTypography } from './styles';

export type TypographyProps = Omit<RNTextProps, 'style'> & {
  variant?: TypographyVariant;
  tone?: Tone;
};

export function Typography({
  variant = 'body',
  tone = 'default',
  children,
  ...rest
}: TypographyProps) {
  return (
    <StyledTypography $variant={variant} $tone={tone} {...rest}>
      {children}
    </StyledTypography>
  );
}
