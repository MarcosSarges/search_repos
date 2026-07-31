import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import type { Size } from '@/components/ds/tokens';
import { sizes } from '@/components/ds/tokens';
import { useTheme } from '@/components/ds/theme';

type IconTone = 'default' | 'muted' | 'primary' | 'danger';

export type IconProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  size?: Size;
  tone?: IconTone;
};

function resolveToneColor(tone: IconTone, colors: ReturnType<typeof useTheme>['colors']): string {
  switch (tone) {
    case 'muted':
      return colors.muted;
    case 'primary':
      return colors.primary;
    case 'danger':
      return colors.danger;
    default:
      return colors.text;
  }
}

export function Icon({ name, size = 'md', tone = 'default' }: IconProps) {
  const theme = useTheme();

  return (
    <Ionicons
      name={name}
      size={sizes[size]}
      color={resolveToneColor(tone, theme.colors)}
      accessibilityRole="image"
    />
  );
}
