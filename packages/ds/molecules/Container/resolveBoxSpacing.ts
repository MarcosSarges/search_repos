import type { Spacing } from '@ds/tokens';

export type BoxSpacingInput = {
  p?: Spacing;
  px?: Spacing;
  py?: Spacing;
  pt?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
  pr?: Spacing;
  m?: Spacing;
  mx?: Spacing;
  my?: Spacing;
  mt?: Spacing;
  mb?: Spacing;
  ml?: Spacing;
  mr?: Spacing;
  gap?: Spacing;
};

export type ResolvedBoxSpacing = {
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  gap: number;
};

type SpacingScale = Readonly<Record<Spacing, number>>;

type AxisShorthands = {
  all?: Spacing;
  axisX?: Spacing;
  axisY?: Spacing;
  top?: Spacing;
  right?: Spacing;
  bottom?: Spacing;
  left?: Spacing;
};

/**
 * CSS-like precedence: all → axis (px/py) → edge. Omitted → 0.
 */
function resolveEdges(scale: SpacingScale, shorthands: AxisShorthands) {
  const { all, axisX, axisY, top, right, bottom, left } = shorthands;
  const base = all === undefined ? 0 : scale[all];
  const x = axisX === undefined ? undefined : scale[axisX];
  const y = axisY === undefined ? undefined : scale[axisY];

  const edgeValue = {
    top: top === undefined ? undefined : scale[top],
    right: right === undefined ? undefined : scale[right],
    bottom: bottom === undefined ? undefined : scale[bottom],
    left: left === undefined ? undefined : scale[left],
  } as const;

  return {
    top: edgeValue.top ?? y ?? base,
    right: edgeValue.right ?? x ?? base,
    bottom: edgeValue.bottom ?? y ?? base,
    left: edgeValue.left ?? x ?? base,
  };
}

export function resolveBoxSpacing(
  scale: SpacingScale,
  input: BoxSpacingInput = {},
): ResolvedBoxSpacing {
  const padding = resolveEdges(scale, {
    all: input.p,
    axisX: input.px,
    axisY: input.py,
    top: input.pt,
    right: input.pr,
    bottom: input.pb,
    left: input.pl,
  });

  const margin = resolveEdges(scale, {
    all: input.m,
    axisX: input.mx,
    axisY: input.my,
    top: input.mt,
    right: input.mr,
    bottom: input.mb,
    left: input.ml,
  });

  return {
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    marginTop: margin.top,
    marginRight: margin.right,
    marginBottom: margin.bottom,
    marginLeft: margin.left,
    gap: input.gap === undefined ? 0 : scale[input.gap],
  };
}
