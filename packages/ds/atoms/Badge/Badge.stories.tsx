import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Badge } from './Badge';

const meta = {
  title: 'DS/Atoms/Badge',
  component: Badge,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'enhancement',
  },
};

export const WithSwatch: Story = {
  args: {
    children: 'bug',
    swatch: 'ff0000',
  },
};

export const HashedSwatch: Story = {
  args: {
    children: 'docs',
    swatch: '#0e8a16',
  },
};
