import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import type { AvatarSize } from '@ds/tokens';

import { Typography } from '../Typography';
import { AvatarImage, AvatarRoot } from './styles';

export type AvatarProps = {
  uri?: string;
  name: string;
  size?: AvatarSize;
  style?: StyleProp<ViewStyle>;
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(uri) && !failed;
  const initials = getInitials(name);

  return (
    <AvatarRoot $size={size} style={style} testID="ds-avatar" accessibilityLabel={name}>
      {showImage ? (
        <AvatarImage
          testID="ds-avatar-image"
          source={{ uri }}
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Typography variant="caption" accessibilityRole="text">
          {initials}
        </Typography>
      )}
    </AvatarRoot>
  );
}
