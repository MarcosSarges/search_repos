export const colors = {
  light: {
    primary: '#0A7EA4',
    background: '#FFFFFF',
    surface: '#F2F4F5',
    text: '#11181C',
    muted: '#687076',
    border: '#D1D5DB',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
  },
  dark: {
    primary: '#22B8CF',
    background: '#151718',
    surface: '#1F2426',
    text: '#ECEDEE',
    muted: '#9BA1A6',
    border: '#2E3338',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
} as const;

export type ColorToken = keyof typeof colors.light;
export type ColorScheme = keyof typeof colors;
