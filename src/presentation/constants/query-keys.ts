import type { DataSource } from '@/application';

export const queryKeys = {
  repos: {
    search: (dataSource: DataSource, query: string) =>
      ['repos', dataSource, 'search', query] as const,
    detail: (dataSource: DataSource, repoId: string) =>
      ['repos', dataSource, 'detail', repoId] as const,
    issues: (dataSource: DataSource, repoId: string) =>
      ['repos', dataSource, 'issues', repoId] as const,
    trending: (dataSource: DataSource) => ['repos', dataSource, 'trending'] as const,
  },
};
