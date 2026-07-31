import { View } from 'react-native';
import styled from 'styled-components/native';

import type { Spacing } from '@/components/ds/tokens';

export type ContainerTone = 'background' | 'surface';

export const StyledContainer = styled(View)<{
  $padding: Spacing;
  $tone: ContainerTone;
  $flex: boolean;
}>`
  padding: ${({ theme, $padding }) => theme.spacing[$padding]}px;
  background-color: ${({ theme, $tone }) => theme.colors[$tone]};
  ${({ $flex }) => ($flex ? 'flex: 1;' : '')}
`;
