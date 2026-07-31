import { sizes } from './sizes';

export type IconToken = {
  size: number;
};

/**
 * Icon scale variants — tokens own the pixel size; Icon atom only selects `variant`.
 */
export const icon = {
  xs: { size: sizes.xs },
  sm: { size: sizes.sm },
  md: { size: sizes.md },
  lg: { size: sizes.lg },
  xl: { size: sizes.xl },
} as const satisfies Record<string, IconToken>;

export type IconVariant = keyof typeof icon;
