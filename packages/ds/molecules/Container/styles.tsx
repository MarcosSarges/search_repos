import type { SurfaceBg } from '@ds/tokens';
import { css, styled } from 'styled-components/native';

export type ContainerJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type ContainerAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type ContainerDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type ContainerWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

export const justifyContentMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
} as const satisfies Record<ContainerJustify, string>;

export const alignItemsMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const satisfies Record<ContainerAlign, string>;

const flexCss = (value: number) => css`
  flex: ${value};
`;

const directionCss = {
  row: css`
    flex-direction: row;
  `,
  column: css`
    flex-direction: column;
  `,
  'row-reverse': css`
    flex-direction: row-reverse;
  `,
  'column-reverse': css`
    flex-direction: column-reverse;
  `,
} as const satisfies Record<ContainerDirection, ReturnType<typeof css>>;

const justifyCss = {
  start: css`
    justify-content: flex-start;
  `,
  center: css`
    justify-content: center;
  `,
  end: css`
    justify-content: flex-end;
  `,
  between: css`
    justify-content: space-between;
  `,
  around: css`
    justify-content: space-around;
  `,
  evenly: css`
    justify-content: space-evenly;
  `,
} as const satisfies Record<ContainerJustify, ReturnType<typeof css>>;

const alignCss = {
  start: css`
    align-items: flex-start;
  `,
  center: css`
    align-items: center;
  `,
  end: css`
    align-items: flex-end;
  `,
  stretch: css`
    align-items: stretch;
  `,
  baseline: css`
    align-items: baseline;
  `,
} as const satisfies Record<ContainerAlign, ReturnType<typeof css>>;

const wrapCss = {
  nowrap: css`
    flex-wrap: nowrap;
  `,
  wrap: css`
    flex-wrap: wrap;
  `,
  'wrap-reverse': css`
    flex-wrap: wrap-reverse;
  `,
} as const satisfies Record<ContainerWrap, ReturnType<typeof css>>;

export const StyledContainer = styled.View<{
  $paddingTop: number;
  $paddingRight: number;
  $paddingBottom: number;
  $paddingLeft: number;
  $marginTop: number;
  $marginRight: number;
  $marginBottom: number;
  $marginLeft: number;
  $gap: number;
  $bg?: SurfaceBg;
  $flex?: number;
  $direction?: ContainerDirection;
  $justify?: ContainerJustify;
  $align?: ContainerAlign;
  $wrap?: ContainerWrap;
}>`
  ${({ theme, $bg }) =>
    $bg === undefined
      ? css``
      : css`
          background-color: ${theme.colors[$bg]};
        `}
  padding-top: ${({ $paddingTop }) => $paddingTop}px;
  padding-right: ${({ $paddingRight }) => $paddingRight}px;
  padding-bottom: ${({ $paddingBottom }) => $paddingBottom}px;
  padding-left: ${({ $paddingLeft }) => $paddingLeft}px;
  margin-top: ${({ $marginTop }) => $marginTop}px;
  margin-right: ${({ $marginRight }) => $marginRight}px;
  margin-bottom: ${({ $marginBottom }) => $marginBottom}px;
  margin-left: ${({ $marginLeft }) => $marginLeft}px;
  gap: ${({ $gap }) => $gap}px;
  ${({ $flex }) => ($flex === undefined ? css`` : flexCss($flex))}
  ${({ $direction }) => ($direction === undefined ? css`` : directionCss[$direction])}
  ${({ $justify }) => ($justify === undefined ? css`` : justifyCss[$justify])}
  ${({ $align }) => ($align === undefined ? css`` : alignCss[$align])}
  ${({ $wrap }) => ($wrap === undefined ? css`` : wrapCss[$wrap])}
`;
