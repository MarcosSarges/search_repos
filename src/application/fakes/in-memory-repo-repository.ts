import type {
  Issue,
  ListIssuesInput,
  PaginatedResult,
  Repo,
  RepoRepository,
  SearchReposInput,
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
        totalCount: filtered.length,
      };
    },

    async getById(repoId: string): Promise<Repo> {
      const repo = repos.find((item) => item.id === repoId);
      if (!repo) {
        throw new Error(`Repo not found: ${repoId}`);
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
        totalCount: all.length,
      };
    },
  };
}
