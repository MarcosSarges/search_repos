import type { ReactNode } from 'react';
import { Keyboard, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from 'styled-components/native';

import type { Spacing, SurfaceBg } from '@ds/tokens';

import { resolveBoxSpacing } from './resolveBoxSpacing';
import {
  StyledContainer,
  type ContainerAlign,
  type ContainerDirection,
  type ContainerJustify,
  type ContainerWrap,
} from './styles';

export type SafeEdge = 'top' | 'bottom' | 'left' | 'right';

const ALL_SAFE_EDGES = ['top', 'bottom', 'left', 'right'] as const satisfies readonly SafeEdge[];

const safeEdgeInsetKey = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
} as const satisfies Record<SafeEdge, SafeEdge>;

function resolveSafeEdgeSet(
  safe: boolean | readonly SafeEdge[] | undefined,
): ReadonlySet<SafeEdge> {
  if (safe === true) {
    return new Set(ALL_SAFE_EDGES);
  }
  if (safe === undefined || safe === false) {
    return new Set();
  }
  return new Set(safe);
}

export type ContainerProps = {
  children?: ReactNode;
  bg?: SurfaceBg;
  style?: StyleProp<ViewStyle>;
  testID?: string;
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
  flex?: number;
  direction?: ContainerDirection;
  justify?: ContainerJustify;
  align?: ContainerAlign;
  wrap?: ContainerWrap;
  safe?: boolean | readonly SafeEdge[];
  keyboardDismiss?: boolean;
};

export function Container({
  children,
  bg,
  style,
  testID = 'ds-container',
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  gap,
  flex,
  direction,
  justify,
  align,
  wrap,
  safe,
  keyboardDismiss = false,
}: ContainerProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const box = resolveBoxSpacing(theme.spacing, {
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    m,
    mx,
    my,
    mt,
    mb,
    ml,
    mr,
    gap,
  });
  const safeEdges = resolveSafeEdgeSet(safe);

  const paddingTop = box.paddingTop + (safeEdges.has(safeEdgeInsetKey.top) ? insets.top : 0);
  const paddingRight =
    box.paddingRight + (safeEdges.has(safeEdgeInsetKey.right) ? insets.right : 0);
  const paddingBottom =
    box.paddingBottom + (safeEdges.has(safeEdgeInsetKey.bottom) ? insets.bottom : 0);
  const paddingLeft = box.paddingLeft + (safeEdges.has(safeEdgeInsetKey.left) ? insets.left : 0);

  const content = keyboardDismiss ? (
    <Pressable accessible={false} onPress={Keyboard.dismiss} style={{ flex: 1 }}>
      {children}
    </Pressable>
  ) : (
    children
  );

  return (
    <StyledContainer
      testID={testID}
      style={style}
      $bg={bg}
      $paddingTop={paddingTop}
      $paddingRight={paddingRight}
      $paddingBottom={paddingBottom}
      $paddingLeft={paddingLeft}
      $marginTop={box.marginTop}
      $marginRight={box.marginRight}
      $marginBottom={box.marginBottom}
      $marginLeft={box.marginLeft}
      $gap={box.gap}
      $flex={flex}
      $direction={direction}
      $justify={justify}
      $align={align}
      $wrap={wrap}>
      {content}
    </StyledContainer>
  );
}
