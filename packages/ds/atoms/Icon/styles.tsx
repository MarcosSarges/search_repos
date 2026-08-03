import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'styled-components/native';

import type { IconSize } from '@ds/tokens';

/** Local until Icon prop renames to `color` (T5). Maps legacy `default` → `text`. */
export type LegacyTone = 'default' | 'muted' | 'primary' | 'danger';

export const StyledIcon = styled(Ionicons).attrs<{
  $variant: IconSize;
  $tone: LegacyTone;
}>(({ theme, $variant, $tone }) => ({
  size: theme.icon[$variant].size,
  color: theme.colors[$tone === 'default' ? 'text' : $tone],
}))``;
