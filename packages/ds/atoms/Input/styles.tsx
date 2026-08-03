import { TextInput } from 'react-native';
import { css, styled } from 'styled-components/native';

import type { InputState } from '@ds/tokens';

export const InputChrome = styled.View<{ $state: InputState }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
  ${({ theme, $state }) => {
    const layout = theme.input;
    const borderColor = theme.colors[layout.state[$state]];
    return css`
      min-height: ${layout.minHeight}px;
      padding-top: ${layout.paddingVertical}px;
      padding-bottom: ${layout.paddingVertical}px;
      padding-left: ${layout.paddingHorizontal}px;
      padding-right: ${layout.paddingHorizontal}px;
      border-radius: ${theme.radius[layout.radius]}px;
      border-width: 1px;
      border-color: ${borderColor};
      background-color: ${theme.colors.surface};
    `;
  }}
`;

export const Slot = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const FieldInput = styled(TextInput)`
  flex: 1;
  padding: 0;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.body.fontFamily};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  font-weight: ${({ theme }) => theme.typography.body.fontWeight};
  line-height: ${({ theme }) => theme.typography.body.lineHeight}px;
  color: ${({ theme }) => theme.colors.text};
`;
