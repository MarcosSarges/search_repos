import { ActivityIndicator } from 'react-native';
import { styled } from 'styled-components/native';

import type { LoadingSize } from '@ds/tokens';

export const StyledLoading = styled(ActivityIndicator).attrs<{
  $size: LoadingSize;
}>(({ theme, $size }) => ({
  color: theme.colors.primary,
  size: theme.loading[$size].indicatorSize,
}))``;
