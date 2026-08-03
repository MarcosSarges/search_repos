import type { ColorToken } from './colors';

/**
 * Surface / canvas background variants — Container, Card.
 * Resolves directly as `theme.colors[bg]` (subset of ColorToken).
 */
export type SurfaceBg = 'background' | 'surface';

export const surfaceBgs = [
  'background',
  'surface',
] as const satisfies readonly SurfaceBg[] & readonly ColorToken[];
