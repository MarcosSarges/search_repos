import type { Size } from '@/components/ds/tokens';

import { StyledLoading } from './styles';

export type LoadingProps = {
  size?: Size;
};

export function Loading({ size = 'md' }: LoadingProps) {
  return <StyledLoading testID="ds-loading" $size={size} />;
}
