import type { ReactNode } from 'react';
import { type TextInputProps } from 'react-native';

import type { InputState } from '@/components/ds/tokens';

import { FieldInput, InputChrome, Slot } from './styles';

export type InputProps = Omit<TextInputProps, 'style'> & {
  leading?: ReactNode;
  trailing?: ReactNode;
  state?: InputState;
};

export function Input({
  leading,
  trailing,
  state = 'default',
  editable = true,
  onChangeText,
  accessibilityState,
  testID = 'ds-input',
  ...rest
}: InputProps) {
  const isDisabled = editable === false;

  return (
    <InputChrome $state={state} testID={testID}>
      {leading ? <Slot>{leading}</Slot> : null}
      <FieldInput
        editable={editable}
        onChangeText={isDisabled ? undefined : onChangeText}
        accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
        testID="ds-input-field"
        {...rest}
      />
      {trailing ? <Slot>{trailing}</Slot> : null}
    </InputChrome>
  );
}
