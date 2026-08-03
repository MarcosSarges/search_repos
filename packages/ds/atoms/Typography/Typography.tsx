import { type TextProps as RNTextProps } from 'react-native';

import type { ContentColor, TypographyVariant } from '@ds/tokens';

import { StyledTypography } from './styles';

export type TypographyProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: ContentColor;
};

export function Typography({
  variant = 'body',
  color = 'text',
  children,
  ...rest
}: TypographyProps) {
  return (
    <StyledTypography $variant={variant} $color={color} {...rest}>
      {children}
    </StyledTypography>
  );
}
