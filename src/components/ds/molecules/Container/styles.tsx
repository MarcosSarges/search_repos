import { css, styled } from 'styled-components/native';

import type { Spacing, SurfaceTone } from '@/components/ds/tokens';

export const StyledContainer = styled.View<{
  $padding: Spacing;
  $tone: SurfaceTone;
  $flex: boolean;
}>`
  padding: ${({ theme, $padding }) => theme.spacing[$padding]}px;
  background-color: ${({ theme, $tone }) => theme.colors[$tone]};
  ${({ $flex }) =>
    $flex
      ? css`
          flex: 1;
        `
      : css``}
`;
