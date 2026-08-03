import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { Hyperlink } from './Hyperlink';

const meta = {
  title: 'DS/Organisms/Hyperlink',
  component: Hyperlink,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof Hyperlink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: 'https://github.com',
    children: 'Abrir no site',
  },
};

export const Caption: Story = {
  args: {
    href: 'https://gitlab.com',
    children: 'Ver no GitLab',
    variant: 'caption',
  },
};
