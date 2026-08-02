import {
  joinApiUrl,
  normalizeGithubApiBase,
  normalizeGitlabApiBase,
} from '../resolve-api-base-url';

describe('normalizeGithubApiBase (CLI-01)', () => {
  it('defaults to https://api.github.com when omitted', () => {
    expect(normalizeGithubApiBase(undefined)).toBe('https://api.github.com');
  });

  it('uses custom baseUrl as-is after stripping trailing slash', () => {
    expect(normalizeGithubApiBase('https://github.empresa.com/api/v3/')).toBe(
      'https://github.empresa.com/api/v3',
    );
  });
});

describe('normalizeGitlabApiBase (CLI-03)', () => {
  it('defaults to https://gitlab.com/api/v4 when omitted', () => {
    expect(normalizeGitlabApiBase(undefined)).toBe('https://gitlab.com/api/v4');
  });

  it('appends /api/v4 when given root origin', () => {
    expect(normalizeGitlabApiBase('https://gitlab.empresa.com')).toBe(
      'https://gitlab.empresa.com/api/v4',
    );
  });

  it('appends /api/v4 when given root with trailing slash', () => {
    expect(normalizeGitlabApiBase('https://gitlab.empresa.com/')).toBe(
      'https://gitlab.empresa.com/api/v4',
    );
  });

  it('does not duplicate /api/v4 when path already ends with it', () => {
    expect(normalizeGitlabApiBase('https://gitlab.empresa.com/api/v4')).toBe(
      'https://gitlab.empresa.com/api/v4',
    );
  });

  it('does not duplicate /api/v4 when path already ends with it and trailing slash', () => {
    expect(normalizeGitlabApiBase('https://gitlab.empresa.com/api/v4/')).toBe(
      'https://gitlab.empresa.com/api/v4',
    );
  });

  it('appends /api/v4 to non-empty path that is not already /api/v4', () => {
    expect(normalizeGitlabApiBase('https://host.example/gitlab')).toBe(
      'https://host.example/gitlab/api/v4',
    );
  });
});

describe('joinApiUrl (CLI-06)', () => {
  it('joins relative path against normalized base via URL API', () => {
    expect(joinApiUrl('https://api.github.com', 'search/repositories')).toBe(
      'https://api.github.com/search/repositories',
    );
  });

  it('strips leading slash on path so join does not drop base path segments', () => {
    expect(joinApiUrl('https://gitlab.empresa.com/api/v4', '/projects')).toBe(
      'https://gitlab.empresa.com/api/v4/projects',
    );
  });

  it('does not glue host and path without a slash', () => {
    const url = joinApiUrl('https://api.github.com', 'repos/facebook/react');
    expect(url).toBe('https://api.github.com/repos/facebook/react');
    expect(url).not.toContain('github.comrepos');
  });
});
