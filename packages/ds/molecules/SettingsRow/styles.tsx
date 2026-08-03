import { View } from 'react-native';
import { styled } from 'styled-components/native';

export const RowRoot = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
  padding-top: ${({ theme }) => theme.spacing.md}px;
  padding-bottom: ${({ theme }) => theme.spacing.md}px;
  padding-left: ${({ theme }) => theme.spacing.md}px;
  padding-right: ${({ theme }) => theme.spacing.md}px;
`;

export const TextColumn = styled(View)`
  flex: 1;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const TrailingSlot = styled(View)`
  flex-shrink: 0;
`;
