import type { FavoriteSnapshot } from '@/presentation/stores';

import { mapFavoriteToRepoItemProps } from '../map-favorite-to-repo-item-props';

const favorite: FavoriteSnapshot = {
  id: 'facebook/react',
  dataSource: 'github',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library',
  stars: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  ownerAvatarUrl: 'https://example.com/a.png',
  favoritedAt: 1_700_000_000_000,
};

describe('mapFavoriteToRepoItemProps (FAV-13)', () => {
  it('WHEN snapshot has language THEN languages is a single badge label', () => {
    expect(mapFavoriteToRepoItemProps(favorite)).toEqual({
      name: 'react',
      description: 'A JavaScript library',
      languages: [{ label: 'JavaScript' }],
      ownerName: 'facebook',
      ownerAvatarUrl: 'https://example.com/a.png',
      stars: 1000,
    });
  });

  it('WHEN language is missing THEN languages is undefined', () => {
    const { language: _language, ...withoutLanguage } = favorite;
    const { languages, ...rest } = mapFavoriteToRepoItemProps(withoutLanguage);
    expect(languages).toBeUndefined();
    expect(rest.name).toBe('react');
  });

  it('WHEN description is missing THEN description is undefined', () => {
    const { description: _description, ...withoutDescription } = favorite;
    expect(mapFavoriteToRepoItemProps(withoutDescription).description).toBeUndefined();
  });

  it('WHEN ownerAvatarUrl is missing THEN ownerAvatarUrl is undefined', () => {
    const { ownerAvatarUrl: _avatar, ...withoutAvatar } = favorite;
    expect(mapFavoriteToRepoItemProps(withoutAvatar).ownerAvatarUrl).toBeUndefined();
  });

  it('WHEN forks are not on snapshot THEN forks prop is omitted', () => {
    expect(mapFavoriteToRepoItemProps(favorite)).not.toHaveProperty('forks');
  });
});
