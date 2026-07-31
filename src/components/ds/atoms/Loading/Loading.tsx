import { ActivityIndicator } from 'react-native';

import type { Size } from '@/components/ds/tokens';
import { useTheme } from '@/components/ds/theme';

export type LoadingProps = {
  size?: Size;
};

function mapIndicatorSize(size: Size): 'small' | 'large' {
  return size === 'lg' || size === 'xl' ? 'large' : 'small';
}

export function Loading({ size = 'md' }: LoadingProps) {
  const theme = useTheme();

  return (
    <ActivityIndicator
      testID="ds-loading"
      color={theme.colors.primary}
      size={mapIndicatorSize(size)}
      accessibilityRole="progressbar"
    />
  );
}
