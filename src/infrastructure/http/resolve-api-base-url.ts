const DEFAULT_GITHUB_API_BASE = 'https://api.github.com';
const DEFAULT_GITLAB_API_BASE = 'https://gitlab.com/api/v4';
const GITLAB_API_SUFFIX = '/api/v4';

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

/**
 * Resolve GitHub REST API base. Omit → official host; custom → use as given (no /api/v4 rules).
 */
export function normalizeGithubApiBase(baseUrl?: string): string {
  if (baseUrl === undefined || baseUrl.trim() === '') {
    return DEFAULT_GITHUB_API_BASE;
  }
  return stripTrailingSlash(new URL(baseUrl).href);
}

/**
 * Resolve GitLab REST API base. Omit → official `/api/v4`.
 * Accepts root origin or full API base; appends `/api/v4` when missing; never duplicates.
 */
export function normalizeGitlabApiBase(baseUrl?: string): string {
  if (baseUrl === undefined || baseUrl.trim() === '') {
    return DEFAULT_GITLAB_API_BASE;
  }

  const parsed = new URL(baseUrl);
  const pathname = stripTrailingSlash(parsed.pathname === '' ? '/' : parsed.pathname);

  if (pathname === '/' || pathname === '') {
    return `${parsed.origin}${GITLAB_API_SUFFIX}`;
  }

  if (pathname === GITLAB_API_SUFFIX || pathname.endsWith(GITLAB_API_SUFFIX)) {
    return `${parsed.origin}${pathname}`;
  }

  return `${parsed.origin}${pathname}${GITLAB_API_SUFFIX}`;
}

/**
 * Join an API-relative path onto a normalized base using the Web URL constructor only.
 */
export function joinApiUrl(normalizedBase: string, relativePath: string): string {
  const baseWithTrailingSlash = normalizedBase.endsWith('/')
    ? normalizedBase
    : `${normalizedBase}/`;
  const path = relativePath.replace(/^\//, '');
  return new URL(path, baseWithTrailingSlash).href;
}
