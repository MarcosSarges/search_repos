import { Text as RNText } from 'react-native';
import styled from 'styled-components/native';

import type { Size } from '@/components/ds/tokens';
import type { TypographyVariant } from '@/components/ds/tokens';

export type TypographyTone = 'default' | 'muted' | 'primary' | 'danger';

const toneColorMap = {
  default: 'text',
  muted: 'muted',
  primary: 'primary',
  danger: 'danger',
} as const satisfies Record<TypographyTone, 'text' | 'muted' | 'primary' | 'danger'>;

export const StyledTypography = styled(RNText)<{
  $variant: TypographyVariant;
  $size: Size;
  $tone: TypographyTone;
}>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $size, $variant }) => {
    const fontSizeByVariant = {
      body: theme.sizes[$size],
      label: theme.sizes[$size],
      caption: theme.sizes[$size],
      heading: theme.sizes.xl,
    } as const satisfies Record<TypographyVariant, number>;
    return fontSizeByVariant[$variant];
  }}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  color: ${({ theme, $tone }) => theme.colors[toneColorMap[$tone]]};
`;
