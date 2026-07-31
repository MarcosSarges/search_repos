import type { ReactNode } from 'react';

import type { Spacing, SurfaceTone } from '@/components/ds/tokens';

import { StyledContainer } from './styles';

export type ContainerProps = {
  children?: ReactNode;
  padding?: Spacing;
  tone?: SurfaceTone;
  flex?: boolean;
};

export function Container({
  children,
  padding = 'md',
  tone = 'background',
  flex = false,
}: ContainerProps) {
  return (
    <StyledContainer testID="ds-container" $padding={padding} $tone={tone} $flex={flex}>
      {children}
    </StyledContainer>
  );
}
