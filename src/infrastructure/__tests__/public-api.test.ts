import * as fs from 'fs';
import * as path from 'path';

import * as infrastructure from '@/infrastructure';

/**
 * APP-14: infrastructure barrel exposes createContainer, typings, Fake, resolveRepository.
 */
describe('infrastructure public API (APP-14)', () => {
  it('WHEN importing from @/infrastructure THEN createContainer, Fake, and resolveRepository are reachable', () => {
    expect(typeof infrastructure.createContainer).toBe('function');
    expect(typeof infrastructure.createInMemoryRepoRepository).toBe('function');
    expect(typeof infrastructure.resolveRepository).toBe('function');

    const container = infrastructure.createContainer({ dataSource: 'github' });
    expect(typeof container.searchRepos).toBe('function');
    expect(typeof container.getRepoDetails).toBe('function');
    expect(typeof container.listRepoIssues).toBe('function');
  });

  it('WHEN the infrastructure barrel source is inspected THEN it re-exports DI and Fake public API', () => {
    const barrelSource = fs.readFileSync(path.join(__dirname, '../index.ts'), 'utf8');

    expect(barrelSource).toMatch(/\bcreateContainer\b/);
    expect(barrelSource).toMatch(/\bCreateContainerDeps\b/);
    expect(barrelSource).toMatch(/\bAppContainer\b/);
    expect(barrelSource).toMatch(/\bcreateInMemoryRepoRepository\b/);
    expect(barrelSource).toMatch(/\bresolveRepository\b/);
  });
});
