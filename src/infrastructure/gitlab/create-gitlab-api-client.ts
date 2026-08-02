import { jsonFetch, type JsonFetchResult } from '../http/json-fetch';
import { joinApiUrl, normalizeGitlabApiBase } from '../http/resolve-api-base-url';
import type { GitlabIssueDto, GitlabProjectDto } from './types';

export type CreateGitlabApiClientOptions = {
  baseUrl?: string;
  token?: string;
};

export type GitlabApiClient = {
  searchProjects(input: {
    query: string;
    page: number;
    perPage: number;
  }): Promise<JsonFetchResult<GitlabProjectDto[]>>;
  getProject(projectId: string): Promise<JsonFetchResult<GitlabProjectDto>>;
  listOpenedIssues(
    projectId: string,
    input: { page: number; perPage: number },
  ): Promise<JsonFetchResult<GitlabIssueDto[]>>;
};

/**
 * GitLab HTTP transport: `/api/v4` host normalize, Bearer auth, jsonFetch.
 */
export function createGitlabApiClient(options: CreateGitlabApiClientOptions = {}): GitlabApiClient {
  const baseUrl = normalizeGitlabApiBase(options.baseUrl);
  const { token } = options;
  const auth = token !== undefined ? { token } : {};

  return {
    async searchProjects({ query, page, perPage }) {
      const url = new URL(joinApiUrl(baseUrl, 'projects'));
      url.searchParams.set('search', query);
      url.searchParams.set('order_by', 'star_count');
      url.searchParams.set('sort', 'desc');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      return jsonFetch<GitlabProjectDto[]>(url.toString(), auth);
    },

    async getProject(projectId) {
      const url = joinApiUrl(baseUrl, `projects/${projectId}`);
      return jsonFetch<GitlabProjectDto>(url, auth);
    },

    async listOpenedIssues(projectId, { page, perPage }) {
      const url = new URL(joinApiUrl(baseUrl, `projects/${projectId}/issues`));
      url.searchParams.set('state', 'opened');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      return jsonFetch<GitlabIssueDto[]>(url.toString(), auth);
    },
  };
}
