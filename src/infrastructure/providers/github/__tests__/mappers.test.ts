import { isAppError } from '@/domain';

import { assertGithubRepoId } from '../assert-repo-id';
import { mapGithubIssue, mapGithubRepo } from '../mappers';
import type { GithubIssueDto, GithubRepoDto } from '../types';

describe('mapGithubRepo', () => {
  const base: GithubRepoDto = {
    full_name: 'facebook/react',
    name: 'react',
    description: 'A JS library',
    stargazers_count: 100,
    forks_count: 50,
    watchers_count: 100,
    language: 'JavaScript',
    owner: { login: 'facebook', avatar_url: 'https://avatar.example/fb' },
    html_url: 'https://github.com/facebook/react',
  };

  it('maps full_name to opaque id and domain fields', () => {
    const repo = mapGithubRepo(base);

    expect(repo.id).toBe('facebook/react');
    expect(repo.name).toBe('react');
    expect(repo.fullName).toBe('facebook/react');
    expect(repo.description).toBe('A JS library');
    expect(repo.stars).toBe(100);
    expect(repo.forks).toBe(50);
    expect(repo.watchers).toBe(100);
    expect(repo.language).toBe('JavaScript');
    expect(repo.ownerName).toBe('facebook');
    expect(repo.ownerAvatarUrl).toBe('https://avatar.example/fb');
    expect(repo.htmlUrl).toBe('https://github.com/facebook/react');
  });

  it('maps null or omitted optional fields to undefined (never null)', () => {
    const repo = mapGithubRepo({
      ...base,
      description: null,
      language: null,
      owner: { login: 'facebook', avatar_url: null },
    });

    expect(repo.description).toBeUndefined();
    expect(repo.language).toBeUndefined();
    expect(repo.ownerAvatarUrl).toBeUndefined();
    expect(Object.values(repo).every((v) => v !== null)).toBe(true);
  });
});

describe('mapGithubIssue', () => {
  const base: GithubIssueDto = {
    id: 42,
    number: 7,
    title: 'Bug',
    user: { login: 'alice', avatar_url: 'https://avatar.example/a' },
    labels: [{ id: 1, name: 'bug', color: 'ff0000' }],
    created_at: '2024-01-01T00:00:00Z',
    html_url: 'https://github.com/facebook/react/issues/7',
  };

  it('maps issue id to string and labels with colors', () => {
    const issue = mapGithubIssue(base);

    expect(issue.id).toBe('42');
    expect(issue.number).toBe(7);
    expect(issue.title).toBe('Bug');
    expect(issue.authorName).toBe('alice');
    expect(issue.authorAvatarUrl).toBe('https://avatar.example/a');
    expect(issue.labels).toEqual([{ id: '1', name: 'bug', color: 'ff0000' }]);
    expect(issue.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(issue.htmlUrl).toBe('https://github.com/facebook/react/issues/7');
  });

  it('maps null/omit on optional issue fields to undefined', () => {
    const issue = mapGithubIssue({
      ...base,
      user: { login: 'bob', avatar_url: null },
      labels: [{ id: 2, name: 'docs', color: null }],
    });

    expect(issue.authorAvatarUrl).toBeUndefined();
    expect(issue.labels[0]?.color).toBeUndefined();
    expect(Object.values(issue).every((v) => v !== null)).toBe(true);
  });
});

describe('assertGithubRepoId', () => {
  it('accepts owner/repo format', () => {
    expect(() => assertGithubRepoId('owner/repo')).not.toThrow();
  });

  it('rejects numeric-only id without slash as invalid_input', () => {
    try {
      assertGithubRepoId('123');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }
  });
});
