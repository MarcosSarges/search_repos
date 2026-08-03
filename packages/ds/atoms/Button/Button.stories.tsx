import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Icon } from '../Icon';
import { Button } from './Button';

const meta = {
  title: 'DS/Atoms/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
    size: 'md',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: spacing.sm }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </View>
  ),
};

export const Loading: Story = {
  args: {
    children: 'Saving',
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
};

export const WithSlots: Story = {
  args: {
    children: 'Continue',
    leading: <Icon name="arrow-forward" size="sm" color="text" />,
    trailing: <Icon name="chevron-forward" size="sm" color="text" />,
  },
};
