/** Minimal GitLab REST DTOs used by mappers (not exported from domain). */

export type GitlabNamespaceDto = {
  name?: string;
  path?: string;
  avatar_url?: string | null;
};

export type GitlabProjectDto = {
  id: number;
  name: string;
  path_with_namespace: string;
  description?: string | null;
  star_count: number;
  forks_count: number;
  /** Rarely present on list/search; prefer 0 when absent. */
  watchers_count?: number;
  language?: string | null;
  namespace?: GitlabNamespaceDto | null;
  web_url: string;
};

export type GitlabIssueDto = {
  id: number;
  iid: number;
  title: string;
  author?: {
    username: string;
    avatar_url?: string | null;
  } | null;
  /** GitLab returns labels as string names. */
  labels?: string[];
  created_at: string;
  web_url: string;
};
