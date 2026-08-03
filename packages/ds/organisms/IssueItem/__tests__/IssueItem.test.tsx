import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import * as Linking from 'expo-linking';

import { formatRelativeDate } from '@ds/utils';
import { cleanup, fireEvent, render, screen } from '@/test';

import { IssueItem, type IssueItemProps } from '../IssueItem';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const fixedNow = new Date('2026-08-03T12:00:00.000Z');

const baseProps: IssueItemProps = {
  number: 42,
  title: 'Fix navigation crash',
  titleHref: 'https://github.com/facebook/react/issues/42',
  authorName: 'octocat',
  authorAvatarUrl: 'https://avatars.example/octocat.png',
  labels: [{ label: 'bug', swatch: 'ff0000' }, { label: 'priority' }],
  state: 'open',
  comments: 3,
  updatedAt: '2026-08-03T11:00:00.000Z',
  now: fixedNow,
};

describe('IssueItem organism (DIC-07)', () => {
  afterEach(() => {
    cleanup();
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
  });

  it('WHEN rendered THEN Hyperlink title, #number, state Badge, author, and relative updatedAt show', async () => {
    const expectedDate = formatRelativeDate(baseProps.updatedAt, { now: fixedNow });

    await render(<IssueItem {...baseProps} />);

    expect(screen.getByText('Fix navigation crash')).toBeTruthy();
    expect(screen.getByText('#42')).toBeTruthy();
    expect(screen.getByText('Aberta')).toBeTruthy();
    expect(screen.getByText('octocat')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByText(expectedDate)).toBeTruthy();
    expect(screen.getByTestId('ds-issue-item')).toBeTruthy();
  });

  it('WHEN state is closed THEN Badge shows Fechada', async () => {
    await render(<IssueItem {...baseProps} state="closed" labels={[]} />);

    expect(screen.getByText('Fechada')).toBeTruthy();
    expect(screen.queryByText('Aberta')).toBeNull();
  });

  it('WHEN labels has items THEN each renders as a Badge', async () => {
    await render(<IssueItem {...baseProps} />);

    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('priority')).toBeTruthy();
  });

  it('WHEN labels is empty or absent THEN labels Badges are omitted (state Badge remains)', async () => {
    await render(<IssueItem {...baseProps} labels={[]} />);
    expect(screen.queryByText('bug')).toBeNull();
    expect(screen.getByText('Aberta')).toBeTruthy();

    await render(<IssueItem {...baseProps} labels={undefined} />);
    expect(screen.queryByText('bug')).toBeNull();
    expect(screen.getByText('Aberta')).toBeTruthy();
  });

  it('WHEN comments is 0 THEN footer still shows 0 with chat icon', async () => {
    await render(<IssueItem {...baseProps} comments={0} />);

    expect(screen.getByLabelText('0 comments')).toBeTruthy();
    expect(screen.getByTestId('ds-issue-item-comments')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('WHEN comments is a positive count THEN footer shows that count', async () => {
    await render(<IssueItem {...baseProps} comments={12} />);

    expect(screen.getByLabelText('12 comments')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
  });

  it('WHEN body and footer are present THEN a horizontal Divider separates them', async () => {
    await render(<IssueItem {...baseProps} />);

    expect(screen.getByTestId('ds-divider')).toBeTruthy();
  });

  it('WHEN title Hyperlink is pressed THEN Linking.openURL is called with titleHref', async () => {
    await render(<IssueItem {...baseProps} />);

    fireEvent.press(screen.getByText('Fix navigation crash'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/facebook/react/issues/42');
  });

  it('WHEN public props are inspected THEN they are primitives (no domain Issue) and style/testID/now are accepted', () => {
    type HasNumber = 'number' extends keyof IssueItemProps ? true : false;
    type HasState = 'state' extends keyof IssueItemProps ? true : false;
    type HasNow = 'now' extends keyof IssueItemProps ? true : false;
    type HasStyle = 'style' extends keyof IssueItemProps ? true : false;
    type HasTestId = 'testID' extends keyof IssueItemProps ? true : false;
    const hasNumber: HasNumber = true;
    const hasState: HasState = true;
    const hasNow: HasNow = true;
    const hasStyle: HasStyle = true;
    const hasTestId: HasTestId = true;
    expect(hasNumber).toBe(true);
    expect(hasState).toBe(true);
    expect(hasNow).toBe(true);
    expect(hasStyle).toBe(true);
    expect(hasTestId).toBe(true);
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'IssueItem.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'IssueItem.stories.tsx'))).toBe(true);
  });

  it('WHEN organism sources are inspected THEN they do not import @/domain, @/stores, or app layers', () => {
    const component = readFileSync(join(__dirname, '../IssueItem.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/@\/domain|@\/stores|@\/presentation|from ['"]@\//i);
    expect(styles).not.toMatch(/@\/domain|@\/stores|@\/presentation|from ['"]@\//i);
  });
});
