import type { LoadingVariant } from './loading';
import { spacing } from './spacing';

export type ButtonVariant = 'primary' | 'outline' | 'ghost';

export type ButtonSizeToken = {
  paddingVertical: number;
  paddingHorizontal: number;
  minHeight: number;
  loadingVariant: LoadingVariant;
};

/**
 * Button size metrics — tokens own padding/minHeight and which Loading variant to use.
 * Chrome colors for variants are resolved in styles via theme.colors (object map).
 */
export const button = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
    loadingVariant: 'sm',
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    loadingVariant: 'sm',
  },
  lg: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    loadingVariant: 'lg',
  },
} as const satisfies Record<string, ButtonSizeToken>;

export type ButtonSize = keyof typeof button;

/**
 * Variant keys for Button — chrome lookup lives in styles (AD-013 object maps).
 */
export const buttonVariants = {
  primary: true,
  outline: true,
  ghost: true,
} as const satisfies Record<ButtonVariant, true>;
