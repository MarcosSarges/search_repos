import type { StyleProp, ViewStyle } from 'react-native';

import { Icon } from '@ds/atoms';
import { Header } from '@ds/molecules';

import { BackButton, BackHeaderRoot } from './styles';

export type BackHeaderProps = {
  title: string;
  onBack: () => void;
  safe?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Stack-style header with a built-in back control (arrow-back icon).
 * Controlled: caller owns navigation via `onBack` — no React Navigation / store imports.
 */
export function BackHeader({
  title,
  onBack,
  safe,
  style,
  testID = 'ds-back-header',
}: BackHeaderProps) {
  return (
    <BackHeaderRoot testID={testID}>
      <Header
        title={title}
        safe={safe}
        style={style}
        leading={
          <BackButton
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={onBack}
            testID="ds-back-header-back">
            <Icon name="arrow-back" size="lg" />
          </BackButton>
        }
      />
    </BackHeaderRoot>
  );
}
