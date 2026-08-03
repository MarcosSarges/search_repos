import { spacing } from './spacing';

export type ButtonVariant = 'contained' | 'outlined' | 'text';
export type ButtonColor = 'primary' | 'success' | 'warning' | 'danger';
export type ButtonWidth = 'hug' | 'full';

export type ButtonSizeToken = {
  paddingVertical: number;
  paddingHorizontal: number;
  minHeight: number;
  /** Loading indicator size key (`sm` | `lg`). */
  loadingSize: 'sm' | 'lg';
};

/**
 * Button size metrics — tokens own padding/minHeight and which Loading size to use.
 * Chrome colors for variants are resolved in styles via theme.colors (object map).
 */
export const button = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 32,
    loadingSize: 'sm',
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
    loadingSize: 'sm',
  },
  lg: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    minHeight: 48,
    loadingSize: 'lg',
  },
} as const satisfies Record<string, ButtonSizeToken>;

export type ButtonSize = keyof typeof button;

/**
 * Variant keys for Button — chrome lookup lives in styles (AD-013 object maps).
 */
export const buttonVariants = {
  contained: true,
  outlined: true,
  text: true,
} as const satisfies Record<ButtonVariant, true>;

export const buttonColors = {
  primary: true,
  success: true,
  warning: true,
  danger: true,
} as const satisfies Record<ButtonColor, true>;

export const buttonWidths = {
  hug: true,
  full: true,
} as const satisfies Record<ButtonWidth, true>;
