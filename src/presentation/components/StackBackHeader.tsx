import type { StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { BackHeader } from '@ds/organisms';

export type StackBackHeaderProps = {
  title: string;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Presentation adapter: React Navigation `goBack` ↔ DS BackHeader (AD-029 pattern).
 * Stack screens (Details/Issues) use this — not SessionSourceHeader (no source toggle).
 */
export function StackBackHeader({ title, safe, style, testID }: StackBackHeaderProps) {
  const navigation = useNavigation();

  return (
    <BackHeader
      title={title}
      onBack={() => {
        navigation.goBack();
      }}
      safe={safe}
      style={style}
      testID={testID}
    />
  );
}
