import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'styled-components/native';

import type { IconVariant, Tone } from '@/components/ds/tokens';
import { toneColorMap } from '@/components/ds/tokens';

export const StyledIcon = styled(Ionicons).attrs<{
  $variant: IconVariant;
  $tone: Tone;
}>(({ theme, $variant, $tone }) => ({
  size: theme.icon[$variant].size,
  color: theme.colors[toneColorMap[$tone]],
}))``;
