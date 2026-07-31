export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export type Spacing = keyof typeof spacing;

export type SpacerEdge = 'top' | 'bottom' | 'left' | 'right';

/**
 * Maps spacer edge to the layout axis dimension used by styles.
 */
export const spacerEdgeAxis = {
  top: 'height',
  bottom: 'height',
  left: 'width',
  right: 'width',
} as const satisfies Record<SpacerEdge, 'height' | 'width'>;
