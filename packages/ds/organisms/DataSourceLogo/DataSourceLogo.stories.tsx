import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@/components/ds/tokens';

import { DataSourceLogo } from './DataSourceLogo';

const meta = {
  title: 'DS/Organisms/DataSourceLogo',
  component: DataSourceLogo,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof DataSourceLogo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FromContext: Story = {
  args: {
    size: 'xl',
  },
};

export const GitHub: Story = {
  args: {
    dataSource: 'github',
    size: 'xl',
  },
};

export const GitLab: Story = {
  args: {
    dataSource: 'gitlab',
    size: 'xl',
  },
};

export const Small: Story = {
  args: {
    dataSource: 'github',
    size: 'sm',
  },
};
