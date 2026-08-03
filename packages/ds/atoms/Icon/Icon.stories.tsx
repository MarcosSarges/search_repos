import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Icon } from './Icon';

const meta = {
  title: 'DS/Atoms/Icon',
  component: Icon,
  decorators: [
    (Story) => (
      <View style={{ gap: spacing.sm, padding: spacing.md }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: 'search',
    size: 'md',
    color: 'text',
  },
};

export const Primary: Story = {
  args: {
    name: 'star',
    size: 'lg',
    color: 'primary',
  },
};

export const Muted: Story = {
  args: {
    name: 'information-circle',
    size: 'sm',
    color: 'muted',
  },
};

export const Danger: Story = {
  args: {
    name: 'alert-circle',
    size: 'md',
    color: 'danger',
  },
};
