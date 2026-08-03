import type { ReactNode } from 'react';
import { Platform } from 'react-native';

import { StyledKeyboardAvoid } from './styles';

export type KeyboardAvoidBehavior = 'height' | 'position' | 'padding';

/** Platform defaults — object map (AD-013), not switch. */
export const keyboardAvoidBehaviorByOs = {
  ios: 'padding',
  android: 'height',
} as const satisfies Record<'ios' | 'android', KeyboardAvoidBehavior>;

export function resolveKeyboardAvoidBehavior(
  os: string,
  override?: KeyboardAvoidBehavior,
): KeyboardAvoidBehavior {
  if (override !== undefined) {
    return override;
  }
  if (os === 'ios' || os === 'android') {
    return keyboardAvoidBehaviorByOs[os];
  }
  return 'padding';
}

export type KeyboardAvoidProps = {
  children?: ReactNode;
  /** Vertical offset passed to KeyboardAvoidingView.keyboardVerticalOffset */
  offset?: number;
  /** Overrides platform default behavior */
  behavior?: KeyboardAvoidBehavior;
  testID?: string;
};

export function KeyboardAvoid({
  children,
  offset = 0,
  behavior: behaviorProp,
  testID = 'ds-keyboard-avoid',
}: KeyboardAvoidProps) {
  const behavior = resolveKeyboardAvoidBehavior(Platform.OS, behaviorProp);

  return (
    <StyledKeyboardAvoid testID={testID} $behavior={behavior} $offset={offset}>
      {children}
    </StyledKeyboardAvoid>
  );
}
