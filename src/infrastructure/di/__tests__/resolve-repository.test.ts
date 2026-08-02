import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';

import { resolveRepository } from '../resolve-repository';

/**
 * APP-09: both DataSource literals resolve to a working RepoRepository (Fake for now).
 */
describe('resolveRepository (APP-09)', () => {
  it.each(['github', 'gitlab'] as const)(
    'WHEN resolveRepository(%s) is called THEN it returns a RepoRepository Fake',
    async (dataSource: DataSource) => {
      const repository: RepoRepository = resolveRepository(dataSource);

      expect(typeof repository.search).toBe('function');
      expect(typeof repository.getById).toBe('function');
      expect(typeof repository.listIssues).toBe('function');

      await expect(repository.getById('missing')).rejects.toMatchObject({ code: 'not_found' });
    },
  );

  it('WHEN called twice for the same source THEN it returns distinct repository instances', () => {
    const first = resolveRepository('github');
    const second = resolveRepository('github');

    expect(first).not.toBe(second);
  });
});
