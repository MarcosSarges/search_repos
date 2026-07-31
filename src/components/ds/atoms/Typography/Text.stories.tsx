import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Text } from './Text';
import { spacing } from '@/components/ds/tokens';

const meta = {
  title: 'Design System/Text',
  component: Text,
  decorators: [
    (Story) => (
      <View style={{ gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Text>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Body: Story = {
  args: {
    children: 'Body text — Design System',
    variant: 'body',
    size: 'md',
    tone: 'default',
  },
};

export const Label: Story = {
  args: {
    children: 'Label text',
    variant: 'label',
    size: 'sm',
    tone: 'default',
  },
};

export const Muted: Story = {
  args: {
    children: 'Muted supporting text',
    variant: 'caption',
    size: 'sm',
    tone: 'muted',
  },
};

export const Danger: Story = {
  args: {
    children: 'Error / danger tone',
    variant: 'body',
    size: 'md',
    tone: 'danger',
  },
};
