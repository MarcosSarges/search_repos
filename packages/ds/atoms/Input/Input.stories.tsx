import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Icon } from '../Icon';
import { Input } from './Input';

const meta = {
  title: 'DS/Atoms/Input',
  component: Input,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory() {
    const [value, setValue] = useState('');
    return <Input value={value} onChangeText={setValue} placeholder="Search repositories" />;
  },
};

export const WithSlots: Story = {
  render: function WithSlotsStory() {
    const [value, setValue] = useState('');
    return (
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="With slots"
        leading={<Icon name="search" variant="sm" tone="muted" />}
        trailing={<Icon name="close-circle" variant="sm" tone="muted" />}
      />
    );
  },
};

export const ErrorState: Story = {
  render: function ErrorStory() {
    const [value, setValue] = useState('bad@');
    return <Input state="error" value={value} onChangeText={setValue} placeholder="Error state" />;
  },
};
