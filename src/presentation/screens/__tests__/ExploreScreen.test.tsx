import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { ExploreScreen } from '../ExploreScreen';

const sampleRepos: Repo[] = [
  {
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
  },
  {
    id: 'vercel/next.js',
    name: 'next.js',
    fullName: 'vercel/next.js',
    description: 'The React Framework',
    stars: 900,
    forks: 150,
    watchers: 900,
    language: 'TypeScript',
    ownerName: 'vercel',
    htmlUrl: 'https://github.com/vercel/next.js',
  },
  {
    id: 'torvalds/linux',
    name: 'linux',
    fullName: 'torvalds/linux',
    description: 'Linux kernel source tree',
    stars: 800,
    forks: 100,
    watchers: 800,
    language: undefined,
    ownerName: 'torvalds',
    htmlUrl: 'https://github.com/torvalds/linux',
  },
];

describe('ExploreScreen (EXP-02,04,05,07,16, RITEM-13)', () => {
  it('WHEN trending results are available THEN rows use RepoItem (Capitalize name, stars, language Badge) (EXP-02, RITEM-13)', async () => {
    const repository = createInMemoryRepoRepository(sampleRepos);

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    expect(screen.getByLabelText('1000 stars')).toBeTruthy();
    expect(screen.getByText('JavaScript')).toBeTruthy();
    expect(screen.getByText('Next.js')).toBeTruthy();
    expect(screen.getByLabelText('900 stars')).toBeTruthy();
    expect(screen.getByText('TypeScript')).toBeTruthy();
    expect(screen.getByText('Linux')).toBeTruthy();
    expect(screen.getByLabelText('800 stars')).toBeTruthy();
    expect(screen.getAllByTestId('ds-repo-item')).toHaveLength(3);
  });

  it('WHEN first page is loading with no items THEN shows loading indicator (EXP-16)', async () => {
    let resolveList!: (value: Awaited<ReturnType<RepoRepository['listTrending']>>) => void;
    const repository: RepoRepository = {
      ...createInMemoryRepoRepository(sampleRepos),
      listTrending: () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    };

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    expect(screen.getByTestId('explore-initial-loading')).toBeTruthy();

    await act(async () => {
      resolveList({
        items: sampleRepos,
        page: 1,
        perPage: 20,
        hasNextPage: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });
  });

  it('WHEN first page returns zero items THEN shows empty state (EXP-05)', async () => {
    const repository = createInMemoryRepoRepository([]);

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByTestId('explore-empty')).toBeTruthy();
    });

    expect(screen.getByText('Nenhum repositório trending encontrado.')).toBeTruthy();
    expect(screen.queryByTestId('explore-initial-loading')).toBeNull();
  });

  it('WHEN first page fails with AppError THEN shows mapped PT-BR message (EXP-04)', async () => {
    const repository: RepoRepository = {
      search: async () => {
        throw createAppError('network');
      },
      getById: async () => {
        throw createAppError('not_found');
      },
      listIssues: async () => {
        throw createAppError('not_found');
      },
      listTrending: async () => {
        throw createAppError('rate_limit');
      },
    };

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByTestId('explore-error')).toBeTruthy();
    });

    expect(screen.getByText(mapAppErrorToMessage(createAppError('rate_limit')))).toBeTruthy();
  });

  it('WHEN next page is loading THEN footer loading shows without clearing visible items (EXP-07)', async () => {
    let resolveSecond!: (value: Awaited<ReturnType<RepoRepository['listTrending']>>) => void;
    let call = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      listTrending: async (input) => {
        call += 1;
        if (call === 1) {
          return {
            items: [sampleRepos[0]],
            page: 1,
            perPage: 1,
            hasNextPage: true,
          };
        }
        return new Promise((resolve) => {
          resolveSecond = resolve;
        });
      },
    };

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    await act(async () => {
      fireEvent(screen.getByTestId('explore-list'), 'onEndReached');
    });

    await waitFor(() => {
      expect(screen.getByTestId('explore-footer-loading')).toBeTruthy();
    });

    expect(screen.getByText('React')).toBeTruthy();

    await act(async () => {
      resolveSecond({
        items: [sampleRepos[1]],
        page: 2,
        perPage: 1,
        hasNextPage: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Next.js')).toBeTruthy();
    });
  });

  it('WHEN next page fails with AppError THEN keeps loaded items and surfaces error', async () => {
    let call = 0;
    const repository: RepoRepository = {
      ...createInMemoryRepoRepository(sampleRepos),
      listTrending: async () => {
        call += 1;
        if (call === 1) {
          return {
            items: [sampleRepos[0]],
            page: 1,
            perPage: 1,
            hasNextPage: true,
          };
        }
        throw createAppError('network');
      },
    };

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    await act(async () => {
      fireEvent(screen.getByTestId('explore-list'), 'onEndReached');
    });

    await waitFor(() => {
      expect(screen.getByTestId('explore-next-page-error')).toBeTruthy();
    });

    expect(screen.getByText('React')).toBeTruthy();
    expect(screen.getByText(mapAppErrorToMessage(createAppError('network')))).toBeTruthy();
    expect(screen.queryByTestId('explore-error')).toBeNull();
  });

  it('WHEN pull-to-refresh THEN refetch replaces list with fresh first page (EXP-09)', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      listTrending: async (input) => {
        listCalls += 1;
        return base.listTrending(input);
      },
    };

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    expect(listCalls).toBe(1);

    const list = screen.getByTestId('explore-list');
    await act(async () => {
      const refreshControl = list.props.refreshControl;
      await refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(listCalls).toBeGreaterThanOrEqual(2);
    });

    expect(screen.getByText('React')).toBeTruthy();
  });

  it('WHEN Explore source is inspected THEN no navigation, Linking, or onPress on rows', () => {
    const source = readFileSync(join(__dirname, '../ExploreScreen.tsx'), 'utf8');
    expect(source).not.toMatch(/Linking|navigation\.|useNavigation|onPress|ExternalLink/);
    expect(source).not.toMatch(/ParallaxScrollView|ThemedText|Collapsible|HelloWave/);
  });

  it('WHEN Explore list is inspected THEN it uses DS FlatList + RepoListItem without RN FlatList (RITEM-13)', () => {
    const source = readFileSync(join(__dirname, '../ExploreScreen.tsx'), 'utf8');
    expect(source).toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]@ds\/molecules['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]react-native['"]/);
    expect(source).toMatch(/RepoListItem/);
    expect(source).toMatch(/px=\{showingList \? undefined : ['"]md['"]\}/);
  });

  it('WHEN Header is shown THEN title is Explore', async () => {
    const repository = createInMemoryRepoRepository(sampleRepos);

    await render(<ExploreScreen />, { repository, dataSource: 'github' });

    await waitFor(() => {
      expect(screen.getByText('Explore')).toBeTruthy();
    });
  });
});
