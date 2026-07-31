import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { Spacing } from '@/components/ds/tokens';
import { useTheme } from '@/components/ds/theme';

type ContainerTone = 'background' | 'surface';

export type ContainerProps = {
  children?: ReactNode;
  padding?: Spacing;
  tone?: ContainerTone;
  flex?: boolean;
};

export function Container({
  children,
  padding = 'md',
  tone = 'background',
  flex = false,
}: ContainerProps) {
  const theme = useTheme();

  return (
    <View
      testID="ds-container"
      style={{
        padding: theme.spacing[padding],
        backgroundColor: theme.colors[tone],
        ...(flex ? { flex: 1 } : null),
      }}
    >
      {children}
    </View>
  );
}
