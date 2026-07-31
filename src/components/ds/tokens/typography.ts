import { Platform } from 'react-native';

export type TypographyVariant = 'body' | 'label' | 'caption' | 'heading';

/**
 * Complete type style — tokens own the variation (fontSize, lineHeight, weight, family).
 * Components only select a variant; they do not compose size × metrics.
 */
export type TypographyToken = {
  fontFamily: string;
  fontWeight: '400' | '600';
  fontSize: number;
  lineHeight: number;
};

/**
 * System typeface tokens (AD-015). Custom fonts via expo-font are out of this slice.
 * RN requires an explicit fontFamily for text to respect the family.
 */
export const SYSTEM_FONT_FAMILY =
  Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }) ?? 'System';

export const typography = {
  body: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  caption: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 18,
  },
  heading: {
    fontFamily: SYSTEM_FONT_FAMILY,
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 34,
  },
} as const satisfies Record<TypographyVariant, TypographyToken>;
