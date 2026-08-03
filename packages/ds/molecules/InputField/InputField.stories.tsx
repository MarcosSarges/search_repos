import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@ds/atoms';
import { spacing } from '@ds/tokens';

import { InputField } from './InputField';

const meta = {
  title: 'DS/Molecules/InputField',
  component: InputField,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, gap: spacing.sm }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof InputField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LabelAndHelper: Story = {
  render: function LabelAndHelperStory() {
    const [value, setValue] = useState('');
    return (
      <InputField
        label="Email"
        helperText="We never share your email"
        value={value}
        onChangeText={setValue}
        placeholder="you@example.com"
      />
    );
  },
};

export const WithError: Story = {
  render: function WithErrorStory() {
    const [value, setValue] = useState('bad@');
    return (
      <InputField
        label="Email"
        helperText="We never share your email"
        error="Enter a valid email"
        value={value}
        onChangeText={setValue}
        placeholder="you@example.com"
      />
    );
  },
};

export const WithSlots: Story = {
  render: function WithSlotsStory() {
    const [value, setValue] = useState('');
    return (
      <InputField
        label="Search"
        helperText="Find repositories"
        value={value}
        onChangeText={setValue}
        placeholder="With slots"
        leading={<Icon name="search" size="sm" color="muted" />}
        trailing={<Icon name="close-circle" size="sm" color="muted" />}
      />
    );
  },
};
