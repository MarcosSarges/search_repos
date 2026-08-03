import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Typography } from '../Typography';
import { BadgeRoot } from './styles';

export type BadgeProps = {
  children: ReactNode;
  swatch?: string;
  style?: StyleProp<ViewStyle>;
};

/** Ensures API hex values work whether or not they include `#`. */
export function normalizeHex(swatch: string): string {
  const trimmed = swatch.trim();
  if (trimmed.startsWith('#')) {
    return trimmed;
  }
  return `#${trimmed}`;
}

export function Badge({ children, swatch, style }: BadgeProps) {
  const accent = swatch ? normalizeHex(swatch) : undefined;

  return (
    <BadgeRoot $swatch={accent} style={style} testID="ds-badge">
      <Typography variant="caption" numberOfLines={1}>
        {children}
      </Typography>
    </BadgeRoot>
  );
}
