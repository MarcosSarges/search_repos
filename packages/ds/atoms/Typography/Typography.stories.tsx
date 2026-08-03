import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

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
    color: 'text',
  },
};

export const Heading: Story = {
  args: {
    children: 'Heading',
    variant: 'heading',
    color: 'text',
  },
};

export const Label: Story = {
  args: {
    children: 'Label text',
    variant: 'label',
    color: 'text',
  },
};

export const Muted: Story = {
  args: {
    children: 'Muted supporting text',
    variant: 'caption',
    color: 'muted',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary color',
    variant: 'body',
    color: 'primary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger / error color',
    variant: 'body',
    color: 'danger',
  },
};
