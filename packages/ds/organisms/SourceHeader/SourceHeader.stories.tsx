import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { useState } from 'react';

import type { Brand } from '@ds/theme';
import { spacing } from '@ds/tokens';

import { SourceHeader } from './SourceHeader';

const meta = {
  title: 'DS/Organisms/SourceHeader',
  component: SourceHeader,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SourceHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const GitHub: Story = {
  args: {
    title: 'Repositories',
    brand: 'github',
    onToggleBrand: () => undefined,
  },
};

export const GitLab: Story = {
  args: {
    title: 'Repositories',
    brand: 'gitlab',
    onToggleBrand: () => undefined,
  },
};

export const ToggleDemo: Story = {
  render: function ToggleDemoRender() {
    const [brand, setBrand] = useState<Brand>('github');
    return (
      <SourceHeader
        title="Search"
        brand={brand}
        onToggleBrand={() => setBrand((b) => (b === 'github' ? 'gitlab' : 'github'))}
      />
    );
  },
};
