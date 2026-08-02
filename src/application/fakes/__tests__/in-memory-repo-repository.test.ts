import { isAppError } from '@/domain';

import { createInMemoryRepoRepository } from '../in-memory-repo-repository';

/**
 * DOM-11: RepoRepository port rejects (via fake) are representable as AppError.
 */
describe('createInMemoryRepoRepository (DOM-11)', () => {
  it('WHEN getById is called for a missing id THEN it rejects with AppError not_found', async () => {
    const repository = createInMemoryRepoRepository([]);

    const rejection = await repository.getById('missing-repo').catch((error: unknown) => error);

    expect(isAppError(rejection)).toBe(true);
    expect(rejection).toMatchObject({ code: 'not_found' });
  });
});
