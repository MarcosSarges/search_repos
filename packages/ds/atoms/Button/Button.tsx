import type { ReactNode } from 'react';
import { type PressableProps } from 'react-native';

import type { ButtonSize } from '@ds/tokens';
import { button } from '@ds/tokens';

import { Loading } from '../Loading';
import { ButtonLabel, ContentRow, StyledButton, type LegacyButtonVariant } from './styles';

export type ButtonProps = Omit<PressableProps, 'style' | 'children' | 'disabled'> & {
  variant?: LegacyButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leading,
  trailing,
  children,
  onPress,
  accessibilityRole = 'button',
  testID = 'ds-button',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const loadingSize = button[size].loadingSize;

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $disabled={isDisabled}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      {...rest}>
      {loading ? (
        <Loading variant={loadingSize} />
      ) : (
        <ContentRow>
          {leading}
          {typeof children === 'string' || typeof children === 'number' ? (
            <ButtonLabel $variant={variant}>{children}</ButtonLabel>
          ) : (
            children
          )}
          {trailing}
        </ContentRow>
      )}
    </StyledButton>
  );
}
