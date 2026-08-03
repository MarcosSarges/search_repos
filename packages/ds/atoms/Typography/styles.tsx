import { Text as RNText } from 'react-native';
import { styled } from 'styled-components/native';

import type { TypographyVariant } from '@ds/tokens';

/** Local until Typography prop renames to `color` (T4). Maps legacy `default` → `text`. */
export type LegacyTone = 'default' | 'muted' | 'primary' | 'danger';

export const StyledTypography = styled(RNText)<{
  $variant: TypographyVariant;
  $tone: LegacyTone;
}>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  color: ${({ theme, $tone }) =>
    theme.colors[$tone === 'default' ? 'text' : $tone]};
`;
