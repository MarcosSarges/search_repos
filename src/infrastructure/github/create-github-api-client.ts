import { jsonFetch, type JsonFetchResult } from '../http/json-fetch';
import { joinApiUrl, normalizeGithubApiBase } from '../http/resolve-api-base-url';
import type { GithubIssueDto, GithubRepoDto, GithubSearchReposResponse } from './types';

export type CreateGithubApiClientOptions = {
  baseUrl?: string;
  token?: string;
};

export type GithubApiClient = {
  searchRepositories(input: {
    query: string;
    page: number;
    perPage: number;
  }): Promise<JsonFetchResult<GithubSearchReposResponse>>;
  getRepository(ownerRepo: string): Promise<JsonFetchResult<GithubRepoDto>>;
  listOpenIssues(
    ownerRepo: string,
    input: { page: number; perPage: number },
  ): Promise<JsonFetchResult<GithubIssueDto[]>>;
};

/**
 * GitHub HTTP transport: host normalize, Bearer auth, jsonFetch.
 */
export function createGithubApiClient(options: CreateGithubApiClientOptions = {}): GithubApiClient {
  const baseUrl = normalizeGithubApiBase(options.baseUrl);
  const { token } = options;
  const auth = token !== undefined ? { token } : {};

  return {
    async searchRepositories({ query, page, perPage }) {
      const url = new URL(joinApiUrl(baseUrl, 'search/repositories'));
      url.searchParams.set('q', query);
      url.searchParams.set('sort', 'stars');
      url.searchParams.set('order', 'desc');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      return jsonFetch<GithubSearchReposResponse>(url.toString(), auth);
    },

    async getRepository(ownerRepo) {
      const url = joinApiUrl(baseUrl, `repos/${ownerRepo}`);
      return jsonFetch<GithubRepoDto>(url, auth);
    },

    async listOpenIssues(ownerRepo, { page, perPage }) {
      const url = new URL(joinApiUrl(baseUrl, `repos/${ownerRepo}/issues`));
      url.searchParams.set('state', 'open');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));
      return jsonFetch<GithubIssueDto[]>(url.toString(), auth);
    },
  };
}
