import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Input, type InputProps, Typography } from '@ds/atoms';

import { FieldRoot } from './styles';

export type InputFieldProps = Omit<InputProps, 'state'> & {
  label?: string;
  helperText?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function InputField({
  label,
  helperText,
  error,
  leading,
  trailing,
  testID = 'ds-input',
  style,
  ...rest
}: InputFieldProps) {
  const hasError = Boolean(error);
  const message = hasError ? error : helperText;
  const messageColor = hasError ? 'danger' : 'muted';

  return (
    <FieldRoot testID="ds-input-field-root" style={style}>
      {label ? <Typography variant="label">{label}</Typography> : null}
      <Input
        leading={leading}
        trailing={trailing}
        state={hasError ? 'error' : 'default'}
        testID={testID}
        {...rest}
      />
      {message ? (
        <Typography variant="caption" color={messageColor} testID="ds-input-field-message">
          {message}
        </Typography>
      ) : null}
    </FieldRoot>
  );
}
