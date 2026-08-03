import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { Typography } from '@ds/atoms';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HeaderTitleSlot, StyledHeader } from './styles';

export type HeaderProps = {
  title: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Header({ title, leading, trailing, safe, style }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <StyledHeader
      testID="ds-header"
      accessibilityRole="header"
      style={style}
      safeTop={safe ? insets.top : null}>
      {leading}
      <HeaderTitleSlot>
        <Typography variant="heading">{title}</Typography>
      </HeaderTitleSlot>
      {trailing}
    </StyledHeader>
  );
}
