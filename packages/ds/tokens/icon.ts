import { sizes } from './sizes';

export type IconToken = {
  size: number;
};

/**
 * Icon scale — tokens own the pixel size; Icon atom selects `size`.
 */
export const icon = {
  xs: { size: sizes.xs },
  sm: { size: sizes.sm },
  md: { size: sizes.md },
  lg: { size: sizes.lg },
  xl: { size: sizes.xl },
} as const satisfies Record<string, IconToken>;

export type IconSize = keyof typeof icon;
