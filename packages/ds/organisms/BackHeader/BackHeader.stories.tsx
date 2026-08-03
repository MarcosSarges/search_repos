import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { BackHeader } from './BackHeader';

const meta = {
  title: 'DS/Organisms/BackHeader',
  component: BackHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof BackHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Detalhes',
    onBack: () => undefined,
  },
};

export const Issues: Story = {
  args: {
    title: 'Issues',
    onBack: () => undefined,
  },
};
