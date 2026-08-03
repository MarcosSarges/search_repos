import { type ActivityIndicatorProps } from 'react-native';

import type { LoadingSize } from '@ds/tokens';

import { StyledLoading } from './styles';

export type LoadingProps = Omit<ActivityIndicatorProps, 'size' | 'color'> & {
  size?: LoadingSize;
};

export function Loading({
  size = 'sm',
  accessibilityRole = 'progressbar',
  testID = 'ds-loading',
  ...rest
}: LoadingProps) {
  return (
    <StyledLoading
      $size={size}
      accessibilityRole={accessibilityRole}
      testID={testID}
      {...rest}
    />
  );
}
