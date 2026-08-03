import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { IconVariant } from '@ds/tokens';

import { StyledIcon, type LegacyTone } from './styles';

export type IconProps = Omit<ComponentProps<typeof Ionicons>, 'style' | 'size' | 'color'> & {
  variant?: IconVariant;
  tone?: LegacyTone;
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
