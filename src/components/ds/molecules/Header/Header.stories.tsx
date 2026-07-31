import type { Meta, StoryObj } from '@storybook/react-native';
import { Pressable } from 'react-native';

import { Icon } from '@/components/ds/atoms';

import { Header } from './Header';

const meta = {
  title: 'DS/Molecules/Header',
  component: Header,
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Search Repos',
  },
};

export const WithTrailing: Story = {
  args: {
    title: 'Search Repos',
    trailing: (
      <Pressable accessibilityRole="button" accessibilityLabel="Settings">
        <Icon name="settings-outline" size="lg" />
      </Pressable>
    ),
  },
};
