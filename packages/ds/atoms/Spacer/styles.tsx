import { View } from 'react-native';
import { css, styled } from 'styled-components/native';

import type { SpacerEdge, Spacing } from '@ds/tokens';
import { spacerEdgeAxis } from '@ds/tokens';

const edgeDimensionCss = {
  height: (value: number) => css`
    height: ${value}px;
  `,
  width: (value: number) => css`
    width: ${value}px;
  `,
} as const;

export const StyledSpacer = styled(View)<{
  $edge: SpacerEdge;
  $spacing: Spacing;
}>`
  ${({ theme, $edge, $spacing }) =>
    edgeDimensionCss[spacerEdgeAxis[$edge]](theme.spacing[$spacing])}
`;
