import type { Repo } from '@/domain';
import { fireEvent, render, screen } from '@/test';

import { RepoListItem } from '../RepoListItem';

const fullRepo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library for building user interfaces',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  htmlUrl: 'https://github.com/facebook/react',
};

const minimalRepo: Repo = {
  id: 'owner/minimal',
  name: 'minimal',
  fullName: 'owner/minimal',
  stars: 0,
  forks: 0,
  watchers: 0,
  ownerName: 'owner',
  htmlUrl: 'https://github.com/owner/minimal',
};

describe('RepoListItem (SRCH-05, SRCH-11, RITEM-10)', () => {
  it('WHEN a repo with all fields is rendered THEN Capitalize name, Badge language, stars/forks, and description show', async () => {
    await render(<RepoListItem repo={fullRepo} onPress={() => undefined} />);

    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByLabelText('facebook')).toBeTruthy();
    expect(screen.getByLabelText('1000 stars')).toBeTruthy();
    expect(screen.getByLabelText('200 forks')).toBeTruthy();
    expect(screen.getByText('JavaScript')).toBeTruthy();
    expect(screen.getByTestId('ds-badge')).toBeTruthy();
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeTruthy();
    expect(screen.getByTestId('ds-repo-item')).toBeTruthy();
  });

  it('WHEN optional description and language are missing THEN the row still renders without crashing', async () => {
    await render(<RepoListItem repo={minimalRepo} onPress={() => undefined} />);

    expect(screen.getByText('Minimal')).toBeTruthy();
    expect(screen.getByLabelText('owner')).toBeTruthy();
    expect(screen.getByLabelText('0 stars')).toBeTruthy();
    expect(screen.getByLabelText('0 forks')).toBeTruthy();
    expect(screen.queryByTestId('ds-badge')).toBeNull();
    expect(screen.queryByText('JavaScript')).toBeNull();
  });

  it('WHEN the row is pressed THEN onPress is called with the opaque repo.id', async () => {
    const onPress = jest.fn();
    await render(<RepoListItem repo={fullRepo} onPress={onPress} />);

    fireEvent.press(screen.getByTestId('repo-list-item'));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith('facebook/react');
  });
});
