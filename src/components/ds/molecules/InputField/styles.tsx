import { View } from 'react-native';
import { styled } from 'styled-components/native';

export const FieldRoot = styled(View)`
  gap: ${({ theme }) => theme.spacing.xs}px;
`;
