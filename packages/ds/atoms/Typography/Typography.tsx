import { type TextProps as RNTextProps } from 'react-native';

import type { TypographyVariant } from '@ds/tokens';

import { StyledTypography, type LegacyTone } from './styles';

export type TypographyProps = Omit<RNTextProps, 'style'> & {
  variant?: TypographyVariant;
  tone?: LegacyTone;
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
