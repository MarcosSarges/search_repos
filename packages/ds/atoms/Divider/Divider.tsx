import type { StyleProp, ViewStyle } from 'react-native';

import { StyledDivider } from './styles';

export type DividerOrientation = 'horizontal' | 'vertical';

export type DividerProps = {
  orientation?: DividerOrientation;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * 1px separator line — horizontal (full width) or vertical (stretch to parent height).
 * Color from `theme.colors.border` (no hardcoded hex).
 */
export function Divider({
  orientation = 'horizontal',
  style,
  testID = 'ds-divider',
}: DividerProps) {
  return <StyledDivider $orientation={orientation} style={style} testID={testID} />;
}
