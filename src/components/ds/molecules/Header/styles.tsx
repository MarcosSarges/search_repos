import { View } from 'react-native';
import styled from 'styled-components/native';

export const StyledHeader = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding-vertical: ${({ theme }) => theme.spacing.sm}px;
  padding-horizontal: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const HeaderTitleSlot = styled(View)`
  flex: 1;
`;
