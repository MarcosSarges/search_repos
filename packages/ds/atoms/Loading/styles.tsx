import { ActivityIndicator } from 'react-native';
import { styled } from 'styled-components/native';

import type { LoadingSize } from '@ds/tokens';

export const StyledLoading = styled(ActivityIndicator).attrs<{
  $variant: LoadingSize;
}>(({ theme, $variant }) => ({
  color: theme.colors.primary,
  size: theme.loading[$variant].indicatorSize,
}))``;
