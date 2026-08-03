import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Divider } from './Divider';

const meta = {
  title: 'DS/Atoms/Divider',
  component: Divider,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, height: 80, flexDirection: 'row' }}>
        <Story />
      </View>
    ),
  ],
  args: {
    orientation: 'vertical',
  },
};
