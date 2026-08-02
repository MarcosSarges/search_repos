import type { Issue, Repo } from '@/domain';

import { createInMemoryRepoRepository } from '../../fakes/in-memory-repo-repository';
import { createGetRepoDetailsUseCase } from '../get-repo-details';
import { createListRepoIssuesUseCase } from '../list-repo-issues';

const repo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library for building user interfaces',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  htmlUrl: 'https://github.com/facebook/react',
};

const issues: Issue[] = [
  {
    id: '1',
    number: 1,
    title: 'Bug report',
    authorName: 'alice',
    labels: [{ id: 'bug', name: 'bug', color: 'ff0000' }],
    createdAt: '2024-01-01T00:00:00.000Z',
    htmlUrl: 'https://github.com/facebook/react/issues/1',
  },
];

describe('createGetRepoDetailsUseCase', () => {
  it('returns repository details by id', async () => {
    const useCase = createGetRepoDetailsUseCase(createInMemoryRepoRepository([repo]));

    await expect(useCase.execute({ repoId: 'facebook/react' })).resolves.toEqual(repo);
  });
});

describe('createListRepoIssuesUseCase', () => {
  it('returns paginated issues for a repository', async () => {
    const useCase = createListRepoIssuesUseCase(
      createInMemoryRepoRepository([repo], { 'facebook/react': issues }),
    );

    const result = await useCase.execute({ repoId: 'facebook/react', page: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Bug report');
  });
});
