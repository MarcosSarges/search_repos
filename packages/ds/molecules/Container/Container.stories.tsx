import type { Meta, StoryObj } from '@storybook/react-native';

import { Typography } from '@ds/atoms';

import { Container } from './Container';

const meta = {
  title: 'DS/Molecules/Container',
  component: Container,
} satisfies Meta<typeof Container>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    p: 'md',
    bg: 'background',
    children: <Typography>Background fill with md padding</Typography>,
  },
};

export const Surface: Story = {
  args: {
    p: 'lg',
    bg: 'surface',
    children: <Typography>Surface fill container</Typography>,
  },
};

export const NoFill: Story = {
  args: {
    p: 'md',
    children: <Typography>No bg — inherits / transparent</Typography>,
  },
};

export const Compact: Story = {
  args: {
    p: 'xs',
    bg: 'background',
    children: <Typography variant="caption">Compact padding</Typography>,
  },
};

export const FlexRow: Story = {
  args: {
    p: 'md',
    flex: 1,
    direction: 'row',
    justify: 'between',
    align: 'center',
    children: (
      <>
        <Typography>Left</Typography>
        <Typography>Right</Typography>
      </>
    ),
  },
};

export const SafeAll: Story = {
  args: {
    p: 'md',
    safe: true,
    children: <Typography>Safe insets additive to padding</Typography>,
  },
};

export const KeyboardDismiss: Story = {
  args: {
    p: 'md',
    flex: 1,
    keyboardDismiss: true,
    children: <Typography>Tap outside inputs to dismiss keyboard</Typography>,
  },
};
