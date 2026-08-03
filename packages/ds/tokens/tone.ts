import type { ColorToken } from './colors';

/**
 * Foreground / content tone variants — owned by tokens, consumed by atoms (Typography, Icon, …).
 */
export type Tone = 'default' | 'muted' | 'primary' | 'danger';

/**
 * Maps each tone to a color token. Components resolve `theme.colors[toneColorMap[tone]]`.
 */
export const toneColorMap = {
  default: 'text',
  muted: 'muted',
  primary: 'primary',
  danger: 'danger',
} as const satisfies Record<Tone, ColorToken>;

/**
 * Surface / canvas tone variants — owned by tokens, consumed by layout molecules (Container, …).
 */
export type SurfaceTone = 'background' | 'surface';
