import styled from 'styled-components/native';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import type { Size } from '@/components/ds/tokens';

type TextVariant = 'body' | 'label' | 'caption';
type TextTone = 'default' | 'muted' | 'primary' | 'danger';

export type TextProps = Omit<RNTextProps, 'style'> & {
  variant?: TextVariant;
  size?: Size;
  tone?: TextTone;
};

const StyledText = styled(RNText)<{
  $variant: TextVariant;
  $size: Size;
  $tone: TextTone;
}>`
  font-size: ${({ theme, $size }) => theme.sizes[$size]}px;
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
  font-weight: ${({ $variant }) => ($variant === 'label' ? '600' : '400')};
  line-height: ${({ $variant }) => ($variant === 'caption' ? 18 : 22)}px;
`;

export function Text({
  variant = 'body',
  size = 'md',
  tone = 'default',
  children,
  ...rest
}: TextProps) {
  return (
    <StyledText $variant={variant} $size={size} $tone={tone} {...rest}>
      {children}
    </StyledText>
  );
}
