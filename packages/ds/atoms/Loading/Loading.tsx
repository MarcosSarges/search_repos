import { type ActivityIndicatorProps } from 'react-native';

import type { LoadingVariant } from '@ds/tokens';

import { StyledLoading } from './styles';

export type LoadingProps = Omit<ActivityIndicatorProps, 'style' | 'size' | 'color'> & {
  variant?: LoadingVariant;
};

export function Loading({
  variant = 'sm',
  accessibilityRole = 'progressbar',
  testID = 'ds-loading',
  ...rest
}: LoadingProps) {
  return (
    <StyledLoading
      $variant={variant}
      accessibilityRole={accessibilityRole}
      testID={testID}
      {...rest}
    />
  );
}
