import type { ReactNode } from 'react';

import type { Spacing, SurfaceTone } from '@/components/ds/tokens';

import { StyledContainer } from './styles';

export type ContainerProps = {
  children?: ReactNode;
  padding?: Spacing;
  tone?: SurfaceTone;
  flex?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  testID?: string;
};

export function Container({
  children,
  padding,
  tone = 'background',
  flex = false,
  justify = 'start',
  align = 'start',
  testID = 'ds-container',
}: ContainerProps) {
  return (
    <StyledContainer
      testID={testID}
      $padding={padding}
      $tone={tone}
      $flex={flex}
      $justify={justify}
      $align={align}>
      {children}
    </StyledContainer>
  );
}
