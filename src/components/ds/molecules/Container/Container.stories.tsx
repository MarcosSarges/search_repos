import type { Meta, StoryObj } from '@storybook/react-native';

import { Typography } from '@/components/ds/atoms';

import { Container } from './Container';

const meta = {
  title: 'DS/Molecules/Container',
  component: Container,
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    padding: 'md',
    tone: 'background',
    children: <Typography>Container with md padding</Typography>,
  },
};

export const Surface: Story = {
  args: {
    padding: 'lg',
    tone: 'surface',
    children: <Typography>Surface tone container</Typography>,
  },
};

export const Compact: Story = {
  args: {
    padding: 'xs',
    tone: 'background',
    children: <Typography size="sm">Compact padding</Typography>,
  },
};
