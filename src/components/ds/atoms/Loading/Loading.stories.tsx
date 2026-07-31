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
    variant: 'sm',
  },
};

export const Large: Story = {
  args: {
    variant: 'lg',
  },
};
