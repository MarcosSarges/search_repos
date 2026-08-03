import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { ContentColor, IconSize } from '@ds/tokens';

import { StyledIcon } from './styles';

export type IconProps = Omit<ComponentProps<typeof Ionicons>, 'size' | 'color'> & {
  size?: IconSize;
  color?: ContentColor;
};

export function Icon({
  name,
  size = 'md',
  color = 'text',
  accessibilityRole = 'image',
  ...rest
}: IconProps) {
  return (
    <StyledIcon
      name={name}
      $size={size}
      $color={color}
      accessibilityRole={accessibilityRole}
      {...rest}
    />
  );
}
