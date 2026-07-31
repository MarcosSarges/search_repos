import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@/components/ds/tokens';

import { Typography } from './Typography';

const meta = {
  title: 'DS/Atoms/Typography',
  component: Typography,
  decorators: [
    (Story) => (
      <View style={{ gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Typography>;

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

export const Heading: Story = {
  args: {
    children: 'Heading',
    variant: 'heading',
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

export const Primary: Story = {
  args: {
    children: 'Primary tone',
    variant: 'body',
    size: 'md',
    tone: 'primary',
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
