import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { RepoItem } from './RepoItem';

const meta = {
  title: 'DS/Organisms/RepoItem',
  component: RepoItem,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof RepoItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    name: 'react native',
    description: 'A framework for building native apps with React',
    languages: [{ label: 'TypeScript', swatch: '3178c6' }],
    ownerName: 'facebook',
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/69631?v=4',
    stars: 120000,
    forks: 24000,
  },
};

export const MissingDescription: Story = {
  args: {
    name: 'minimal',
    languages: [{ label: 'JavaScript' }],
    ownerName: 'owner',
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
    stars: 10,
    forks: 2,
  },
};

export const EmptyLanguages: Story = {
  args: {
    name: 'no languages',
    description: 'Card without language badges',
    languages: [],
    ownerName: 'octocat',
    ownerAvatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    stars: 42,
  },
};

export const MissingAvatarUri: Story = {
  args: {
    name: 'initials fallback',
    description: 'Avatar falls back to owner initials',
    languages: [{ label: 'Go' }],
    ownerName: 'Jane Doe',
    stars: 7,
    forks: 0,
  },
};
