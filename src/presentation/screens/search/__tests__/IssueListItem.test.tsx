import * as Linking from 'expo-linking';

import type { Issue } from '@/domain';
import { formatRelativeDate } from '@ds';
import { fireEvent, render, screen } from '@/test';

import { IssueListItem } from '../IssueListItem';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const fixedNow = new Date('2026-08-03T12:00:00.000Z');

const fullIssue: Issue = {
  id: 'issue-1',
  number: 42,
  title: 'Fix navigation crash',
  authorName: 'octocat',
  authorAvatarUrl: 'https://avatars.example/octocat.png',
  labels: [
    { id: 'bug', name: 'bug', color: 'ff0000' },
    { id: 'prio', name: 'priority' },
  ],
  createdAt: '2026-08-03T11:00:00.000Z',
  updatedAt: '2026-08-03T11:30:00.000Z',
  state: 'open',
  comments: 3,
  htmlUrl: 'https://github.com/facebook/react/issues/42',
};

const noLabelsIssue: Issue = {
  id: 'issue-2',
  number: 7,
  title: 'Docs typo',
  authorName: 'writer',
  labels: [],
  createdAt: '2026-08-02T12:00:00.000Z',
  updatedAt: '2026-08-02T12:00:00.000Z',
  state: 'closed',
  comments: 0,
  htmlUrl: 'https://github.com/owner/repo/issues/7',
};

describe('IssueListItem (RDI-06)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
  });

  it('WHEN an issue with labels is rendered THEN title Hyperlink, Badges, author, and relative date show', async () => {
    const expectedDate = formatRelativeDate(fullIssue.createdAt, { now: fixedNow });

    await render(<IssueListItem issue={fullIssue} now={fixedNow} />);

    expect(screen.getByText('Fix navigation crash')).toBeTruthy();
    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('priority')).toBeTruthy();
    expect(screen.getAllByTestId('ds-badge')).toHaveLength(2);
    expect(screen.getByText('octocat')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByText(expectedDate)).toBeTruthy();
    expect(screen.getByTestId('ds-card')).toBeTruthy();
  });

  it('WHEN issue has zero labels THEN no Badge is rendered and row does not crash', async () => {
    await render(<IssueListItem issue={noLabelsIssue} now={fixedNow} />);

    expect(screen.getByText('Docs typo')).toBeTruthy();
    expect(screen.queryByTestId('ds-badge')).toBeNull();
    expect(screen.getByText('writer')).toBeTruthy();
  });

  it('WHEN title Hyperlink is pressed THEN Linking.openURL is called with issue.htmlUrl', async () => {
    await render(<IssueListItem issue={fullIssue} now={fixedNow} />);

    fireEvent.press(screen.getByText('Fix navigation crash'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/facebook/react/issues/42');
  });
});
