import { queryKeys } from '../query-keys';

describe('queryKeys (PRES-07, PRES-08, PRES-09, PRES-10)', () => {
  it('repos.search returns readonly tuple with dataSource and query', () => {
    expect(queryKeys.repos.search('github', 'react')).toEqual([
      'repos',
      'github',
      'search',
      'react',
    ]);
    expect(queryKeys.repos.search('gitlab', 'react')).toEqual([
      'repos',
      'gitlab',
      'search',
      'react',
    ]);
    expect(queryKeys.repos.search('github', 'react')).not.toEqual(
      queryKeys.repos.search('gitlab', 'react'),
    );
  });

  it('repos.detail returns readonly tuple with dataSource and repoId', () => {
    expect(queryKeys.repos.detail('github', 'facebook/react')).toEqual([
      'repos',
      'github',
      'detail',
      'facebook/react',
    ]);
    expect(queryKeys.repos.detail('gitlab', 'facebook/react')).toEqual([
      'repos',
      'gitlab',
      'detail',
      'facebook/react',
    ]);
    expect(queryKeys.repos.detail('github', 'facebook/react')).not.toEqual(
      queryKeys.repos.detail('gitlab', 'facebook/react'),
    );
  });

  it('repos.issues returns readonly tuple with dataSource and repoId', () => {
    expect(queryKeys.repos.issues('github', 'facebook/react')).toEqual([
      'repos',
      'github',
      'issues',
      'facebook/react',
    ]);
    expect(queryKeys.repos.issues('gitlab', 'facebook/react')).toEqual([
      'repos',
      'gitlab',
      'issues',
      'facebook/react',
    ]);
    expect(queryKeys.repos.issues('github', 'facebook/react')).not.toEqual(
      queryKeys.repos.issues('gitlab', 'facebook/react'),
    );
  });

  it('repos.trending returns readonly tuple with dataSource (EXP-03)', () => {
    expect(queryKeys.repos.trending('github')).toEqual(['repos', 'github', 'trending']);
    expect(queryKeys.repos.trending('gitlab')).toEqual(['repos', 'gitlab', 'trending']);
    expect(queryKeys.repos.trending('github')).not.toEqual(queryKeys.repos.trending('gitlab'));
  });
});
