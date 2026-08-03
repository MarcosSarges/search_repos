export const radius = {
  sm: 4,
  md: 8,
  lg: 16,
} as const;

export type Radius = keyof typeof radius;
