import type { Meta, StoryObj } from '@storybook/react-native';
import { Pressable, Text, View } from 'react-native';

import { Icon } from '@ds/atoms';
import { spacing } from '@ds/tokens';

import { SettingsRow } from './SettingsRow';

const meta = {
  title: 'DS/Molecules/SettingsRow',
  component: SettingsRow,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SettingsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Static: Story = {
  args: {
    icon: 'git-branch-outline',
    title: 'Fonte ativa',
    subtitle: 'GitHub',
  },
};

export const WithTrailing: Story = {
  args: {
    icon: 'moon-outline',
    title: 'Tema',
    subtitle: 'Alternar entre claro e escuro',
    trailing: (
      <Pressable accessibilityRole="button" accessibilityLabel="Toggle theme">
        <Icon name="sunny-outline" size="md" />
      </Pressable>
    ),
  },
};

export const PressableRow: Story = {
  args: {
    icon: 'key-outline',
    title: 'Token de API',
    subtitle: 'Em breve — configure seu token com segurança',
    onPress: () => undefined,
    trailing: <Text>Em breve</Text>,
  },
};
