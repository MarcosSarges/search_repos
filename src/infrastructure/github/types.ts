/** Minimal GitHub REST DTOs used by mappers (not exported from domain). */

export type GithubOwnerDto = {
  login: string;
  avatar_url?: string | null;
};

export type GithubRepoDto = {
  full_name: string;
  name: string;
  description?: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count?: number;
  language?: string | null;
  owner: GithubOwnerDto;
  html_url: string;
};

export type GithubLabelDto = {
  id: number | string;
  name: string;
  color?: string | null;
};

export type GithubIssueDto = {
  id: number;
  number: number;
  title: string;
  user?: {
    login: string;
    avatar_url?: string | null;
  } | null;
  labels?: GithubLabelDto[];
  created_at: string;
  updated_at: string;
  state: 'open' | 'closed';
  comments: number;
  html_url: string;
  /** Present when the list item is a pull request mixed into /issues. */
  pull_request?: unknown;
};

export type GithubSearchReposResponse = {
  total_count: number;
  items: GithubRepoDto[];
};
