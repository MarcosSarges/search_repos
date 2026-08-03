import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, Typography, type IconProps } from '@ds/atoms';

import { Container } from '../Container';

export type SettingsRowProps = {
  icon: IconProps['name'];
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function SettingsRow({
  icon,
  title,
  subtitle,
  trailing,
  onPress,
  style,
  testID = 'ds-settings-row',
}: SettingsRowProps) {
  const body = (
    <>
      <Icon name={icon} size="md" color="muted" />
      <Container flex={1} gap="xs">
        <Typography variant="body">{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" color="muted" testID="ds-settings-row-subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </Container>
      {trailing}
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={style} testID={testID}>
        <Container direction="row" align="center" gap="md" p="md">
          {body}
        </Container>
      </Pressable>
    );
  }

  return (
    <Container direction="row" align="center" gap="md" p="md" style={style} testID={testID}>
      {body}
    </Container>
  );
}
