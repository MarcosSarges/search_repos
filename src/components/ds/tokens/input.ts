import type { ColorToken } from './colors';
import type { Radius } from './radius';
import { spacing } from './spacing';

export type InputState = 'default' | 'error';

/**
 * Maps each Input state to a color token key (border/chrome). Components resolve
 * `theme.colors[inputStateMap[state]]` — no hardcoded hex.
 */
export const inputStateMap = {
  default: 'border',
  error: 'danger',
} as const satisfies Record<InputState, ColorToken>;

/**
 * Single-density Input field layout + state chrome map (AD-017).
 */
export const input = {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  radius: 'md' as Radius,
  minHeight: 44,
  state: inputStateMap,
} as const;
