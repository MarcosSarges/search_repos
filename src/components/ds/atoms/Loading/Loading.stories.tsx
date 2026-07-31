import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@/components/ds/tokens';

import { Loading } from './Loading';

const meta = {
  title: 'DS/Atoms/Loading',
  component: Loading,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: 'md',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
  },
};
