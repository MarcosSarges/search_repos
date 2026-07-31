import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { IconVariant, Tone } from '@/components/ds/tokens';

import { StyledIcon } from './styles';

export type IconProps = Omit<ComponentProps<typeof Ionicons>, 'style' | 'size' | 'color'> & {
  variant?: IconVariant;
  tone?: Tone;
};

export function Icon({
  name,
  variant = 'md',
  tone = 'default',
  accessibilityRole = 'image',
  ...rest
}: IconProps) {
  return (
    <StyledIcon
      name={name}
      $variant={variant}
      $tone={tone}
      accessibilityRole={accessibilityRole}
      {...rest}
    />
  );
}
