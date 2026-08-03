import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

import { spacing } from '@ds/tokens';

import { IssueItem } from './IssueItem';

const fixedNow = new Date('2026-08-03T12:00:00.000Z');

const meta = {
  title: 'DS/Organisms/IssueItem',
  component: IssueItem,
  decorators: [
    (Story) => (
      <View style={{ padding: spacing.lg }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof IssueItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OpenWithLabels: Story = {
  args: {
    number: 42,
    title: 'Fix navigation crash',
    titleHref: 'https://github.com/facebook/react/issues/42',
    authorName: 'octocat',
    authorAvatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
    labels: [
      { label: 'bug', swatch: 'ff0000' },
      { label: 'priority', swatch: '0e8a16' },
    ],
    state: 'open',
    comments: 3,
    updatedAt: '2026-08-03T11:00:00.000Z',
    now: fixedNow,
  },
};

export const ClosedNoLabels: Story = {
  args: {
    number: 7,
    title: 'Docs typo',
    titleHref: 'https://github.com/owner/repo/issues/7',
    authorName: 'writer',
    labels: [],
    state: 'closed',
    comments: 0,
    updatedAt: '2026-08-02T12:00:00.000Z',
    now: fixedNow,
  },
};

export const MissingAvatarUri: Story = {
  args: {
    number: 99,
    title: 'Initials fallback for author',
    titleHref: 'https://github.com/owner/repo/issues/99',
    authorName: 'Jane Doe',
    state: 'open',
    comments: 12,
    updatedAt: '2026-08-01T08:00:00.000Z',
    now: fixedNow,
  },
};
