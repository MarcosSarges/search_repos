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

export const ContainedPrimary: Story = {
  args: {
    children: 'Contained primary',
    variant: 'contained',
    color: 'primary',
    size: 'md',
  },
};

export const OutlinedPrimary: Story = {
  args: {
    children: 'Outlined primary',
    variant: 'outlined',
    color: 'primary',
  },
};

export const TextPrimary: Story = {
  args: {
    children: 'Text primary',
    variant: 'text',
    color: 'primary',
  },
};

export const ContainedDanger: Story = {
  args: {
    children: 'Contained danger',
    variant: 'contained',
    color: 'danger',
  },
};

export const OutlinedSuccess: Story = {
  args: {
    children: 'Outlined success',
    variant: 'outlined',
    color: 'success',
  },
};

export const TextWarning: Story = {
  args: {
    children: 'Text warning',
    variant: 'text',
    color: 'warning',
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

export const WidthHug: Story = {
  args: {
    children: 'Hug content',
    width: 'hug',
  },
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
