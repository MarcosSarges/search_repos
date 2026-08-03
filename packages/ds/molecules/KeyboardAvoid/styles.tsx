import { KeyboardAvoidingView } from 'react-native';
import { styled } from 'styled-components/native';

import type { KeyboardAvoidBehavior } from './KeyboardAvoid';

type HostAttrs = {
  $behavior: KeyboardAvoidBehavior;
  $offset: number;
};

export const StyledKeyboardAvoid = styled(KeyboardAvoidingView).attrs<HostAttrs>(
  ({ $behavior, $offset }) => ({
    behavior: $behavior,
    keyboardVerticalOffset: $offset,
  }),
)`
  flex: 1;
`;
