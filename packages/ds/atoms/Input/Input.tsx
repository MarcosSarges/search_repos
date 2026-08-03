import type { ReactNode } from 'react';
import { type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import type { InputState } from '@ds/tokens';

import { FieldInput, InputChrome, Slot } from './styles';

type TextInputFieldProps = {
  [K in keyof TextInputProps as K extends 'style' ? never : K]: TextInputProps[K];
};

export type InputProps = TextInputFieldProps & {
  leading?: ReactNode;
  trailing?: ReactNode;
  state?: InputState;
  style?: StyleProp<ViewStyle>;
};

export function Input({
  leading,
  trailing,
  state = 'default',
  editable = true,
  onChangeText,
  accessibilityState,
  testID = 'ds-input',
  style,
  ...rest
}: InputProps) {
  const isDisabled = editable === false;

  return (
    <InputChrome $state={state} testID={testID} style={style}>
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
