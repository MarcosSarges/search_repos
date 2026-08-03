import { Pressable, Text } from 'react-native';
import { styled } from 'styled-components/native';

import type { TypographyVariant } from '@ds/tokens';

export const StyledHyperlinkPressable = styled(Pressable)``;

export const StyledHyperlinkText = styled(Text)<{ $variant: TypographyVariant }>`
  font-family: ${({ theme, $variant }) => theme.typography[$variant].fontFamily};
  font-size: ${({ theme, $variant }) => theme.typography[$variant].fontSize}px;
  font-weight: ${({ theme, $variant }) => theme.typography[$variant].fontWeight};
  line-height: ${({ theme, $variant }) => theme.typography[$variant].lineHeight}px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration-line: underline;
`;
