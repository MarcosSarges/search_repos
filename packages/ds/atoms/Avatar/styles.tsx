import { Image } from 'expo-image';
import { View } from 'react-native';
import { styled } from 'styled-components/native';

import type { AvatarSize } from '@ds/tokens';

export const AvatarRoot = styled(View)<{ $size: AvatarSize }>`
  width: ${({ theme, $size }) => theme.avatar[$size].size}px;
  height: ${({ theme, $size }) => theme.avatar[$size].size}px;
  border-radius: ${({ theme, $size }) => theme.avatar[$size].size / 2}px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.surface};
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

export const AvatarImage = styled(Image)`
  width: 100%;
  height: 100%;
`;
