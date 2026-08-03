import { Text as RNText } from 'react-native';
import { styled } from 'styled-components/native';

import type { ContentColor, TypographyVariant } from '@ds/tokens';

export const StyledTypography = styled(RNText)<{
  $variant: TypographyVariant;
  $color: ContentColor;
}>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  color: ${({ theme, $color }) => theme.colors[$color]};
`;
