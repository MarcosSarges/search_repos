import { View } from 'react-native';
import { styled } from 'styled-components/native';

export const BodyStack = styled(View)`
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const MetaRow = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

export const BadgesRow = styled(View)`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;

export const StatsRow = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md}px;
`;

export const Stat = styled(View)`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
