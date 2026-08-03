import type { StyleProp, ViewStyle } from 'react-native';
import * as Linking from 'expo-linking';

import type { TypographyVariant } from '@ds/tokens';

import { StyledHyperlinkPressable, StyledHyperlinkText } from './styles';

export type HyperlinkProps = {
  href: string;
  children: string;
  accessibilityLabel?: string;
  variant?: TypographyVariant;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function Hyperlink({
  href,
  children,
  accessibilityLabel,
  variant = 'body',
  style,
  testID = 'ds-hyperlink',
}: HyperlinkProps) {
  return (
    <StyledHyperlinkPressable
      testID={testID}
      style={style}
      accessibilityRole="link"
      accessibilityLabel={accessibilityLabel ?? children}
      onPress={() => {
        void Linking.openURL(href).catch(() => undefined);
      }}>
      <StyledHyperlinkText $variant={variant}>{children}</StyledHyperlinkText>
    </StyledHyperlinkPressable>
  );
}
