import type { ComponentProps } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { Size } from '@/components/ds/tokens';

import { StyledIcon, type IconTone } from './styles';

export type IconProps = {
  name: ComponentProps<typeof Ionicons>['name'];
  size?: Size;
  tone?: IconTone;
};

export function Icon({ name, size = 'md', tone = 'default' }: IconProps) {
  return <StyledIcon name={name} $size={size} $tone={tone} />;
}
