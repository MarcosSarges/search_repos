import { View } from 'react-native';
import { css, styled } from 'styled-components/native';

type Orientation = 'horizontal' | 'vertical';

/** Orientation chrome — object map (AD-013). */
const orientationChrome = {
  horizontal: css`
    height: 1px;
    width: 100%;
    align-self: stretch;
  `,
  vertical: css`
    width: 1px;
    align-self: stretch;
  `,
} as const satisfies Record<Orientation, ReturnType<typeof css>>;

export const StyledDivider = styled(View)<{ $orientation: Orientation }>`
  background-color: ${({ theme }) => theme.colors.border};

  ${({ $orientation }) => orientationChrome[$orientation]}
`;
