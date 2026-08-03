import type { Meta, StoryObj } from '@storybook/react-native';

import { Typography } from '@ds/atoms';

import { Container } from '../Container';
import { KeyboardAvoid } from './KeyboardAvoid';

const meta = {
  title: 'DS/Molecules/KeyboardAvoid',
  component: KeyboardAvoid,
} satisfies Meta<typeof KeyboardAvoid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithContainer: Story = {
  args: {
    offset: 0,
    children: (
      <Container p="md" flex={1} keyboardDismiss>
        <Typography>
          KeyboardAvoid outside + Container inside (tap to dismiss keyboard)
        </Typography>
      </Container>
    ),
  },
};

export const WithOffset: Story = {
  args: {
    offset: 24,
    children: (
      <Container p="md" flex={1}>
        <Typography>Custom vertical offset</Typography>
      </Container>
    ),
  },
};
