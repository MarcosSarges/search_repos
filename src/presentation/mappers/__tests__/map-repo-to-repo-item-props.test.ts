import type { Repo } from '@/domain';

import { mapRepoToRepoItemProps } from '../map-repo-to-repo-item-props';

const repo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  ownerAvatarUrl: 'https://example.com/a.png',
  htmlUrl: 'https://github.com/facebook/react',
};

describe('mapRepoToRepoItemProps (RITEM-13)', () => {
  it('WHEN repo has language THEN languages is a single badge label', () => {
    expect(mapRepoToRepoItemProps(repo)).toEqual({
      name: 'react',
      description: 'A JavaScript library',
      languages: [{ label: 'JavaScript' }],
      ownerName: 'facebook',
      ownerAvatarUrl: 'https://example.com/a.png',
      stars: 1000,
      forks: 200,
    });
  });

  it('WHEN language is missing THEN languages is undefined', () => {
    const { languages, ...rest } = mapRepoToRepoItemProps({ ...repo, language: undefined });
    expect(languages).toBeUndefined();
    expect(rest.name).toBe('react');
  });
});
