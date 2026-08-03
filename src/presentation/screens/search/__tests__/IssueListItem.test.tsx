import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

describe('IssueListItem (DIC-08)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
  });

  it('WHEN an issue is rendered THEN maps to IssueItem with #number, state, comments, and relative updatedAt', async () => {
    const expectedDate = formatRelativeDate(fullIssue.updatedAt, { now: fixedNow });

    await render(<IssueListItem issue={fullIssue} now={fixedNow} />);

    expect(screen.getByTestId('ds-issue-item')).toBeTruthy();
    expect(screen.getByText('Fix navigation crash')).toBeTruthy();
    expect(screen.getByText('#42')).toBeTruthy();
    expect(screen.getByText('Aberta')).toBeTruthy();
    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('priority')).toBeTruthy();
    expect(screen.getByText('octocat')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByText(expectedDate)).toBeTruthy();
    expect(screen.getByLabelText('3 comments')).toBeTruthy();
  });

  it('WHEN issue has zero labels THEN labels Badges are omitted and closed state + 0 comments show', async () => {
    await render(<IssueListItem issue={noLabelsIssue} now={fixedNow} />);

    expect(screen.getByText('Docs typo')).toBeTruthy();
    expect(screen.getByText('#7')).toBeTruthy();
    expect(screen.getByText('Fechada')).toBeTruthy();
    expect(screen.queryByText('bug')).toBeNull();
    expect(screen.getByText('writer')).toBeTruthy();
    expect(screen.getByLabelText('0 comments')).toBeTruthy();
  });

  it('WHEN title Hyperlink is pressed THEN Linking.openURL is called with issue.htmlUrl', async () => {
    await render(<IssueListItem issue={fullIssue} now={fixedNow} />);

    fireEvent.press(screen.getByText('Fix navigation crash'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/facebook/react/issues/42');
  });

  it('WHEN IssueListItem source is inspected THEN it is a thin adapter without Card layout', () => {
    const source = readFileSync(join(__dirname, '../IssueListItem.tsx'), 'utf8');

    expect(source).toMatch(/IssueItem/);
    expect(source).not.toMatch(/from\s+['"]@ds\/molecules['"]/);
    expect(source).not.toMatch(/<Card/);
    expect(source).not.toMatch(/<Badge/);
    expect(source).not.toMatch(/formatRelativeDate/);
  });
});
