import type { ReactNode } from 'react';

import { Input, type InputProps, Typography } from '@ds/atoms';

import { FieldRoot } from './styles';

export type InputFieldProps = Omit<InputProps, 'style' | 'state'> & {
  label?: string;
  helperText?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function InputField({
  label,
  helperText,
  error,
  leading,
  trailing,
  testID = 'ds-input',
  ...rest
}: InputFieldProps) {
  const hasError = Boolean(error);
  const message = hasError ? error : helperText;
  const messageColor = hasError ? 'danger' : 'muted';

  return (
    <FieldRoot testID="ds-input-field-root">
      {label ? <Typography variant="label">{label}</Typography> : null}
      <Input
        leading={leading}
        trailing={trailing}
        state={hasError ? 'error' : 'default'}
        testID={testID}
        {...rest}
      />
      {message ? (
        <Typography variant="caption" color={messageColor}>
          {message}
        </Typography>
      ) : null}
    </FieldRoot>
  );
}
