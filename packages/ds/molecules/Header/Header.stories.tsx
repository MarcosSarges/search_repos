import type { Meta, StoryObj } from '@storybook/react-native';
import { Pressable } from 'react-native';

import { Icon } from '@/components/ds/atoms';
import { DataSourceLogo } from '@/components/ds/organisms';

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

export const WithLeadingLogo: Story = {
  args: {
    title: 'Search Repos',
    leading: <DataSourceLogo size="lg" />,
  },
};

export const WithTrailing: Story = {
  args: {
    title: 'Search Repos',
    leading: <DataSourceLogo size="lg" />,
    trailing: (
      <Pressable accessibilityRole="button" accessibilityLabel="Settings">
        <Icon name="settings-outline" variant="lg" />
      </Pressable>
    ),
  },
};
