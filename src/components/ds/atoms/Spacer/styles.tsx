import { View } from 'react-native';
import styled, { css } from 'styled-components/native';

import type { Spacing } from '@/components/ds/tokens';

export type SpacerEdge = 'top' | 'bottom' | 'left' | 'right';

const edgeDimensionCss = {
  top: (value: number) => css`
    height: ${value}px;
  `,
  bottom: (value: number) => css`
    height: ${value}px;
  `,
  left: (value: number) => css`
    width: ${value}px;
  `,
  right: (value: number) => css`
    width: ${value}px;
  `,
} as const satisfies Record<SpacerEdge, (value: number) => ReturnType<typeof css>>;

export const StyledSpacer = styled(View)<{
  $edge: SpacerEdge;
  $spacing: Spacing;
}>`
  ${({ theme, $edge, $spacing }) => edgeDimensionCss[$edge](theme.spacing[$spacing])}
`;
