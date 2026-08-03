import { Text as RNText } from 'react-native';
import { styled } from 'styled-components/native';

import type { Tone, TypographyVariant } from '@ds/tokens';
import { toneColorMap } from '@ds/tokens';

export const StyledTypography = styled(RNText)<{
  $variant: TypographyVariant;
  $tone: Tone;
}>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  color: ${({ theme, $tone }) => theme.colors[toneColorMap[$tone]]};
`;
