import Ionicons from '@expo/vector-icons/Ionicons';
import { styled } from 'styled-components/native';

import type { ContentColor, IconSize } from '@ds/tokens';

export const StyledIcon = styled(Ionicons).attrs<{
  $size: IconSize;
  $color: ContentColor;
}>(({ theme, $size, $color }) => ({
  size: theme.icon[$size].size,
  color: theme.colors[$color],
}))``;
