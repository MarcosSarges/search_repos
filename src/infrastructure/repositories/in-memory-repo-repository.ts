import {
  createAppError,
  type Issue,
  type ListIssuesInput,
  type ListTrendingInput,
  type PaginatedResult,
  type Repo,
  type RepoRepository,
  type SearchReposInput,
} from '@/domain';

export function createInMemoryRepoRepository(
  repos: Repo[] = [],
  issuesByRepoId: Record<string, Issue[]> = {},
): RepoRepository {
  return {
    async search(input: SearchReposInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const normalized = input.query.toLowerCase();
      const filtered = repos.filter(
        (repo) =>
          repo.name.toLowerCase().includes(normalized) ||
          repo.fullName.toLowerCase().includes(normalized) ||
          (repo.description?.toLowerCase().includes(normalized) ?? false),
      );

      const start = (input.page - 1) * perPage;
      const items = filtered.slice(start, start + perPage);

      return {
        items,
        page: input.page,
        perPage,
        hasNextPage: start + perPage < filtered.length,
      };
    },

    async getById(repoId: string): Promise<Repo> {
      const repo = repos.find((item) => item.id === repoId);
      if (!repo) {
        throw createAppError('not_found');
      }
      return repo;
    },

    async listIssues(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
      const perPage = input.perPage ?? 20;
      const all = issuesByRepoId[input.repoId] ?? [];
      const start = (input.page - 1) * perPage;
      const items = all.slice(start, start + perPage);

      return {
        items,
        page: input.page,
        perPage,
        hasNextPage: start + perPage < all.length,
      };
    },

    async listTrending(input: ListTrendingInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      // Fake ignores the temporal trending window — sort by stars desc only (EXP-15).
      const sorted = [...repos].sort((a, b) => b.stars - a.stars);
      const start = (input.page - 1) * perPage;
      const items = sorted.slice(start, start + perPage);

      return {
        items,
        page: input.page,
        perPage,
        hasNextPage: start + perPage < sorted.length,
      };
    },
  };
}
