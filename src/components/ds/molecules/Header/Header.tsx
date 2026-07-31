import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Typography } from '@/components/ds/atoms';
import { DataSourceLogo } from '@/components/ds/organisms';
import { useTheme } from '@/components/ds/theme';

export type HeaderProps = {
  title: string;
  trailing?: ReactNode;
};

export function Header({ title, trailing }: HeaderProps) {
  const theme = useTheme();

  return (
    <View
      testID="ds-header"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.background,
      }}
      accessibilityRole="header"
    >
      <DataSourceLogo size="lg" />
      <View style={{ flex: 1 }}>
        <Typography variant="heading" size="lg">
          {title}
        </Typography>
      </View>
      {trailing}
    </View>
  );
}
