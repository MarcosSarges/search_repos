import { ActivityIndicator } from 'react-native';
import { styled } from 'styled-components/native';

import type { LoadingVariant } from '@/components/ds/tokens';

export const StyledLoading = styled(ActivityIndicator).attrs<{
  $variant: LoadingVariant;
}>(({ theme, $variant }) => ({
  color: theme.colors.primary,
  size: theme.loading[$variant].indicatorSize,
}))``;
