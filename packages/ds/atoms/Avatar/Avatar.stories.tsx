import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Avatar } from './Avatar';

const meta = {
  title: 'DS/Atoms/Avatar',
  component: Avatar,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  args: {
    name: 'Ada Lovelace',
    size: 'md',
  },
};

export const WithUri: Story = {
  args: {
    name: 'Ada Lovelace',
    uri: 'https://avatars.githubusercontent.com/u/1?v=4',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    name: 'Grace Hopper',
    size: 'xl',
  },
};
