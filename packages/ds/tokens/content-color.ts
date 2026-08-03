import type { ColorToken } from './colors';

/**
 * Foreground / content color variants — Typography, Icon, captions.
 * Resolves directly as `theme.colors[color]` (subset of ColorToken).
 */
export type ContentColor = 'text' | 'muted' | 'primary' | 'danger';

export const contentColors = [
  'text',
  'muted',
  'primary',
  'danger',
] as const satisfies readonly ContentColor[] & readonly ColorToken[];
