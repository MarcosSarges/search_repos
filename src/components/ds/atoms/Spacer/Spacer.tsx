import { View } from 'react-native';

import type { Spacing } from '@/components/ds/tokens';
import { useTheme } from '@/components/ds/theme';

type SpacerEdge = 'top' | 'bottom' | 'left' | 'right';

type SpacerBase = {
  size: Spacing;
};

export type SpacerProps = SpacerBase &
  (
    | { top: true; bottom?: never; left?: never; right?: never }
    | { bottom: true; top?: never; left?: never; right?: never }
    | { left: true; top?: never; bottom?: never; right?: never }
    | { right: true; top?: never; bottom?: never; left?: never }
  );

function resolveEdge(props: SpacerProps): SpacerEdge {
  if (props.top) return 'top';
  if (props.bottom) return 'bottom';
  if (props.left) return 'left';
  if (props.right) return 'right';
  throw new Error('Spacer requires exactly one edge: top | bottom | left | right');
}

export function Spacer(props: SpacerProps) {
  const theme = useTheme();
  const edge = resolveEdge(props);
  const value = theme.spacing[props.size];

  const style =
    edge === 'top' || edge === 'bottom' ? { height: value } : { width: value };

  return <View testID="ds-spacer" style={style} />;
}
