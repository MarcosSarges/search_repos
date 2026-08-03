import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { Icon, Typography, type IconProps } from '@ds/atoms';

import { RowRoot, TextColumn, TrailingSlot } from './styles';

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
  const content = (
    <>
      <Icon name={icon} size="md" color="muted" />
      <TextColumn>
        <Typography variant="body">{title}</Typography>
        {subtitle ? (
          <Typography variant="caption" color="muted" testID="ds-settings-row-subtitle">
            {subtitle}
          </Typography>
        ) : null}
      </TextColumn>
      {trailing ? <TrailingSlot>{trailing}</TrailingSlot> : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={style}
        testID={testID}>
        <RowRoot>{content}</RowRoot>
      </Pressable>
    );
  }

  return (
    <RowRoot style={style} testID={testID}>
      {content}
    </RowRoot>
  );
}
