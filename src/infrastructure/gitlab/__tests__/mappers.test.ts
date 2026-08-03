import { isAppError } from '@/domain';

import { assertGitlabRepoId } from '../assert-repo-id';
import { mapGitlabIssue, mapGitlabRepo } from '../mappers';
import type { GitlabIssueDto, GitlabProjectDto } from '../types';

describe('mapGitlabRepo', () => {
  const base: GitlabProjectDto = {
    id: 278964,
    name: 'GitLab',
    path_with_namespace: 'gitlab-org/gitlab',
    description: 'GitLab CE/EE',
    star_count: 1000,
    forks_count: 200,
    watchers_count: 50,
    language: 'Ruby',
    namespace: {
      name: 'gitlab-org',
      path: 'gitlab-org',
      avatar_url: 'https://avatar.example/gl',
    },
    web_url: 'https://gitlab.com/gitlab-org/gitlab',
  };

  it('maps project.id to opaque numeric-string id and domain fields', () => {
    const repo = mapGitlabRepo(base);

    expect(repo.id).toBe('278964');
    expect(repo.name).toBe('GitLab');
    expect(repo.fullName).toBe('gitlab-org/gitlab');
    expect(repo.description).toBe('GitLab CE/EE');
    expect(repo.stars).toBe(1000);
    expect(repo.forks).toBe(200);
    expect(repo.watchers).toBe(50);
    expect(repo.language).toBe('Ruby');
    expect(repo.ownerName).toBe('gitlab-org');
    expect(repo.ownerAvatarUrl).toBe('https://avatar.example/gl');
    expect(repo.htmlUrl).toBe('https://gitlab.com/gitlab-org/gitlab');
  });

  it('maps null/omit optionals to undefined and watchers/language gaps to 0 / undefined', () => {
    const repo = mapGitlabRepo({
      id: 1,
      name: 'vue',
      path_with_namespace: 'vuejs/vue',
      description: null,
      star_count: 10,
      forks_count: 2,
      // watchers_count omitted → 0
      // language omitted → undefined
      namespace: { name: 'vuejs', avatar_url: null },
      web_url: 'https://gitlab.com/vuejs/vue',
    });

    expect(repo.id).toBe('1');
    expect(repo.description).toBeUndefined();
    expect(repo.watchers).toBe(0);
    expect(repo.language).toBeUndefined();
    expect(repo.ownerAvatarUrl).toBeUndefined();
    expect(Object.values(repo).every((v) => v !== null)).toBe(true);
  });
});

describe('mapGitlabIssue', () => {
  const base: GitlabIssueDto = {
    id: 42,
    iid: 7,
    title: 'Bug',
    author: { username: 'alice', avatar_url: 'https://avatar.example/a' },
    labels: ['bug', 'priority'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-02T12:00:00Z',
    state: 'opened',
    user_notes_count: 5,
    web_url: 'https://gitlab.com/gitlab-org/gitlab/-/issues/7',
  };

  it('maps issue id to string, iid to number, and string labels to IssueLabel', () => {
    const issue = mapGitlabIssue(base);

    expect(issue.id).toBe('42');
    expect(issue.number).toBe(7);
    expect(issue.title).toBe('Bug');
    expect(issue.authorName).toBe('alice');
    expect(issue.authorAvatarUrl).toBe('https://avatar.example/a');
    expect(issue.labels).toEqual([
      { id: 'bug', name: 'bug', color: undefined },
      { id: 'priority', name: 'priority', color: undefined },
    ]);
    expect(issue.createdAt).toBe('2024-01-01T00:00:00Z');
    expect(issue.htmlUrl).toBe('https://gitlab.com/gitlab-org/gitlab/-/issues/7');
  });

  it('WHEN a GitLab issue DTO is mapped THEN opened→open, user_notes_count→comments, updated_at→updatedAt (DIC-04, DIC-05)', () => {
    const issue = mapGitlabIssue(base);

    expect(issue.state).toBe('open');
    expect(issue.comments).toBe(5);
    expect(issue.updatedAt).toBe('2024-01-02T12:00:00Z');
  });

  it('WHEN GitLab state is closed THEN domain state is closed', () => {
    const issue = mapGitlabIssue({ ...base, state: 'closed', user_notes_count: 0 });

    expect(issue.state).toBe('closed');
    expect(issue.comments).toBe(0);
  });

  it('maps null/omit on optional issue fields to undefined', () => {
    const issue = mapGitlabIssue({
      ...base,
      author: { username: 'bob', avatar_url: null },
      labels: undefined,
    });

    expect(issue.authorAvatarUrl).toBeUndefined();
    expect(issue.labels).toEqual([]);
    expect(Object.values(issue).every((v) => v !== null)).toBe(true);
  });
});

describe('assertGitlabRepoId', () => {
  it('accepts numeric string id', () => {
    expect(() => assertGitlabRepoId('278964')).not.toThrow();
    expect(() => assertGitlabRepoId('0')).not.toThrow();
  });

  it('rejects non-numeric path-style id as invalid_input', () => {
    try {
      assertGitlabRepoId('vuejs/vue');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }
  });
});
