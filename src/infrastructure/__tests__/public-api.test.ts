import * as fs from 'fs';
import * as path from 'path';

import * as infrastructure from '@/infrastructure';

/**
 * INFRA-33: infrastructure barrel exposes DI, Fake, and HTTP factory creators.
 */
describe('infrastructure public API (INFRA-33)', () => {
  it('WHEN importing from @/infrastructure THEN createContainer, Fake, resolveRepository, and HTTP factories are reachable', () => {
    expect(typeof infrastructure.createContainer).toBe('function');
    expect(typeof infrastructure.createInMemoryRepoRepository).toBe('function');
    expect(typeof infrastructure.resolveRepository).toBe('function');
    expect(typeof infrastructure.createGithubRepoRepository).toBe('function');
    expect(typeof infrastructure.createGitlabRepoRepository).toBe('function');

    const container = infrastructure.createContainer({ dataSource: 'github' });
    expect(typeof container.searchRepos).toBe('function');
    expect(typeof container.getRepoDetails).toBe('function');
    expect(typeof container.listRepoIssues).toBe('function');
    expect(typeof container.listTrendingRepos).toBe('function');
  });

  it('WHEN the infrastructure barrel source is inspected THEN it re-exports DI, Fake, and HTTP factories', () => {
    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');

    expect(barrelSource).toMatch(/\bcreateContainer\b/);
    expect(barrelSource).toMatch(/\bCreateContainerDeps\b/);
    expect(barrelSource).toMatch(/\bAppContainer\b/);
    expect(barrelSource).toMatch(/\bcreateInMemoryRepoRepository\b/);
    expect(barrelSource).toMatch(/\bresolveRepository\b/);
    expect(barrelSource).toMatch(/\bcreateGithubRepoRepository\b/);
    expect(barrelSource).toMatch(/\bcreateGitlabRepoRepository\b/);
  });
});
