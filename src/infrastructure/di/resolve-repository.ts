import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';

import { createInMemoryRepoRepository } from '../repositories/in-memory-repo-repository';

const factories: Record<DataSource, () => RepoRepository> = {
  github: () => createInMemoryRepoRepository(),
  gitlab: () => createInMemoryRepoRepository(),
};

export function resolveRepository(dataSource: DataSource): RepoRepository {
  return factories[dataSource]();
}
