import type { AppError, Issue, Repo, RepoRepository } from '@/domain';

import { createInMemoryRepoRepository } from '@/infrastructure';
import { createGetRepoDetails } from '../get-repo-details';
import { createListRepoIssues } from '../list-repo-issues';

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

describe('createGetRepoDetails', () => {
  it('returns repository details by id', async () => {
    const getRepoDetails = createGetRepoDetails(createInMemoryRepoRepository([repo]));

    await expect(getRepoDetails({ repoId: 'facebook/react' })).resolves.toEqual(repo);
  });

  it('rejects empty repoId with invalid_input', async () => {
    const getRepoDetails = createGetRepoDetails(createInMemoryRepoRepository([repo]));

    await expect(getRepoDetails({ repoId: '   ' })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });
});

describe('createListRepoIssues', () => {
  it('returns paginated issues for a repository', async () => {
    const listRepoIssues = createListRepoIssues(
      createInMemoryRepoRepository([repo], { 'facebook/react': issues }),
    );

    const result = await listRepoIssues({ repoId: 'facebook/react', page: 1 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Bug report');
  });

  it('rejects empty repoId with invalid_input', async () => {
    const listRepoIssues = createListRepoIssues(
      createInMemoryRepoRepository([repo], { 'facebook/react': issues }),
    );

    await expect(listRepoIssues({ repoId: '' })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });

  it('applies default page 1 and perPage 20 when omitted', async () => {
    const listIssues = jest.fn().mockResolvedValue({
      items: [],
      page: 1,
      perPage: 20,
      hasNextPage: false,
    });
    const repository: RepoRepository = {
      search: jest.fn(),
      getById: jest.fn(),
      listIssues,
      listTrending: jest.fn(),
    };
    const listRepoIssues = createListRepoIssues(repository);

    await listRepoIssues({ repoId: 'facebook/react' });

    expect(listIssues).toHaveBeenCalledWith({
      repoId: 'facebook/react',
      page: 1,
      perPage: 20,
    });
  });

  it('rejects invalid page with invalid_input', async () => {
    const listRepoIssues = createListRepoIssues(
      createInMemoryRepoRepository([repo], { 'facebook/react': issues }),
    );

    await expect(listRepoIssues({ repoId: 'facebook/react', page: 0 })).rejects.toMatchObject({
      code: 'invalid_input',
    } satisfies Partial<AppError>);
  });
});
