import { View } from 'react-native';
import { styled } from 'styled-components/native';

export const FooterRoot = styled(View)`
  padding-vertical: ${({ theme }) => theme.spacing.md}px;
  align-items: center;
  justify-content: center;
`;
