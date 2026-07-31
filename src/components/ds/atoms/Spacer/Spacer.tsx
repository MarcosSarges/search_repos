import type { Spacing } from '@/components/ds/tokens';

import { StyledSpacer, type SpacerEdge } from './styles';

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

const edgeFlagMap = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
} as const satisfies Record<SpacerEdge, SpacerEdge>;

function resolveEdge(props: SpacerProps): SpacerEdge {
  const flags: SpacerEdge[] = [];
  if (props.top) flags.push(edgeFlagMap.top);
  if (props.bottom) flags.push(edgeFlagMap.bottom);
  if (props.left) flags.push(edgeFlagMap.left);
  if (props.right) flags.push(edgeFlagMap.right);

  if (flags.length !== 1) {
    throw new Error('Spacer requires exactly one edge: top | bottom | left | right');
  }

  return flags[0];
}

export function Spacer(props: SpacerProps) {
  const edge = resolveEdge(props);

  return <StyledSpacer testID="ds-spacer" $edge={edge} $spacing={props.size} />;
}
