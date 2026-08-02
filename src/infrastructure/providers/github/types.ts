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
  html_url: string;
};

export type GithubSearchReposResponse = {
  total_count: number;
  items: GithubRepoDto[];
};
