import Ionicons from '@expo/vector-icons/Ionicons';
import styled from 'styled-components/native';

import type { Size } from '@/components/ds/tokens';

export type IconTone = 'default' | 'muted' | 'primary' | 'danger';

const toneColorMap = {
  default: 'text',
  muted: 'muted',
  primary: 'primary',
  danger: 'danger',
} as const satisfies Record<IconTone, 'text' | 'muted' | 'primary' | 'danger'>;

export const StyledIcon = styled(Ionicons).attrs<{
  $size: Size;
  $tone: IconTone;
}>(({ theme, $size, $tone }) => ({
  size: theme.sizes[$size],
  color: theme.colors[toneColorMap[$tone]],
  accessibilityRole: 'image' as const,
}))``;
