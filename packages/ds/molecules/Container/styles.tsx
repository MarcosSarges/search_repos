import { css, styled } from 'styled-components/native';

import type { Spacing, SurfaceTone } from '@/components/ds/tokens';

export const StyledContainer = styled.View<{
  $padding?: Spacing;
  $tone?: SurfaceTone;
  $flex?: boolean;
  $justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  $align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
}>`
  padding: ${({ theme, $padding }) => ($padding ? theme.spacing[$padding] : 0)}px;
  background-color: ${({ theme, $tone }) => ($tone ? theme.colors[$tone] : theme.colors.background)};
  ${({ $flex, $justify, $align }) =>
    $flex
      ? css`
          flex: 1;
          justify-content: ${$justify};
          align-items: ${$align};
        `
      : css``}
`;
