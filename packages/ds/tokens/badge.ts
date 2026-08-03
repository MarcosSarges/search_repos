import { radius } from './radius';
import { spacing } from './spacing';

/**
 * Badge chip metrics — padding/radius via object map (AD-013).
 */
export const badge = {
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  radius: radius.sm,
} as const;

export type BadgeToken = typeof badge;
