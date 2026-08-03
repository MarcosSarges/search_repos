import type { ColorToken } from './colors';
import type { Radius } from './radius';
import type { SurfaceBg } from './surface';

/**
 * Card surface chrome — own radius / border / surface (not Container).
 */
export const card = {
  radius: 'md' as Radius,
  borderColorToken: 'border' as ColorToken,
  surfaceTone: 'surface' as SurfaceBg,
} as const;
