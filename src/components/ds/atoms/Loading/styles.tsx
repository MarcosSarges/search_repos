import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import type { Size } from '@/components/ds/tokens';

const indicatorSizeMap = {
  xs: 'small',
  sm: 'small',
  md: 'small',
  lg: 'large',
  xl: 'large',
} as const satisfies Record<Size, 'small' | 'large'>;

export const StyledLoading = styled(ActivityIndicator).attrs<{
  $size: Size;
}>(({ theme, $size }) => ({
  color: theme.colors.primary,
  size: indicatorSizeMap[$size],
  accessibilityRole: 'progressbar' as const,
}))``;
