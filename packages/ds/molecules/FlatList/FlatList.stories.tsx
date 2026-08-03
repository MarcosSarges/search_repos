import type { Meta, StoryObj } from '@storybook/react-native';
import { Text, View } from 'react-native';

import { Typography } from '@ds/atoms';
import { spacing } from '@ds/tokens';

import { FlatList } from './FlatList';

const DATA = [
  { id: '1', title: 'react' },
  { id: '2', title: 'react-native' },
  { id: '3', title: 'expo' },
];

const meta = {
  title: 'DS/Molecules/FlatList',
  component: FlatList,
  decorators: [
    (Story) => (
      <View style={{ flex: 1, height: 320, paddingVertical: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof FlatList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DefaultPaddingAndSeparator: Story = {
  args: {
    data: DATA,
    keyExtractor: (item: (typeof DATA)[number]) => item.id,
    renderItem: ({ item }: { item: (typeof DATA)[number] }) => (
      <Typography variant="body">{item.title}</Typography>
    ),
  },
};

export const NoSeparatorCustomPx: Story = {
  args: {
    data: DATA,
    keyExtractor: (item: (typeof DATA)[number]) => item.id,
    renderItem: ({ item }: { item: (typeof DATA)[number] }) => (
      <Text>{item.title}</Text>
    ),
    separator: false,
    px: 'lg',
  },
};
