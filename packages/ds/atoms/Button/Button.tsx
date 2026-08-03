import type { ReactNode } from 'react';
import { type PressableProps } from 'react-native';

import type { ButtonColor, ButtonSize, ButtonVariant, ButtonWidth } from '@ds/tokens';
import { button } from '@ds/tokens';

import { Loading } from '../Loading';
import { ButtonLabel, ContentRow, StyledButton } from './styles';

export type ButtonProps = Omit<PressableProps, 'children' | 'disabled'> & {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  width?: ButtonWidth;
  loading?: boolean;
  disabled?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = 'contained',
  color = 'primary',
  size = 'md',
  width = 'full',
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
      $color={color}
      $size={size}
      $width={width}
      $disabled={isDisabled}
      disabled={isDisabled}
      onPress={isDisabled ? undefined : onPress}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      {...rest}>
      {loading ? (
        <Loading size={loadingSize} />
      ) : (
        <ContentRow>
          {leading}
          {typeof children === 'string' || typeof children === 'number' ? (
            <ButtonLabel $variant={variant} $color={color}>
              {children}
            </ButtonLabel>
          ) : (
            children
          )}
          {trailing}
        </ContentRow>
      )}
    </StyledButton>
  );
}
