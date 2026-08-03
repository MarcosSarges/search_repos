import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { Typography } from '@ds/atoms/Typography';
import { spacing } from '@ds/tokens';

import { Spacer } from './Spacer';

const meta = {
  title: 'DS/Atoms/Spacer',
  component: Spacer,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.md }}>
        <Typography>Above</Typography>
        <Story />
        <Typography>Below</Typography>
      </View>
    ),
  ],
} satisfies Meta<typeof Spacer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TopMd: Story = {
  args: {
    top: true,
    size: 'md',
  },
};

export const LeftLg: Story = {
  decorators: [
    (Story) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md }}>
        <Typography>Left</Typography>
        <Story />
        <Typography>Right</Typography>
      </View>
    ),
  ],
  args: {
    left: true,
    size: 'lg',
  },
};
