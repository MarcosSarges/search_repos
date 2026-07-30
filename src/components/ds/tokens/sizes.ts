export const sizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

export type Size = keyof typeof sizes;
