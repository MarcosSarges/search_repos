export type AvatarToken = {
  size: number;
};

/**
 * Avatar scale — dedicated pixel map (not typography `sizes`).
 */
export const avatar = {
  sm: { size: 24 },
  md: { size: 40 },
  lg: { size: 56 },
  xl: { size: 72 },
} as const satisfies Record<string, AvatarToken>;

export type AvatarSize = keyof typeof avatar;
