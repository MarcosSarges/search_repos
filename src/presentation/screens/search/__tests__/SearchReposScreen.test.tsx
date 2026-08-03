import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { SEARCH_DEBOUNCE_MS } from '@/presentation/constants/search';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useSessionPreferencesStore } from '@/stores/session-preferences-store';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@/test';

import { RepoDetailsScreen } from '../RepoDetailsScreen';
import { SearchReposScreen } from '../SearchReposScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

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
    language: 'JavaScript',
    ownerName: 'vercel',
    htmlUrl: 'https://github.com/vercel/next.js',
  },
];

async function renderSearchStack(repository?: RepoRepository) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="SearchRepos" component={SearchReposScreen} />
        <Stack.Screen name="RepoDetails" component={RepoDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
    { repository, dataSource: 'github' },
  );
}

async function typeAndWaitForDebounce(text: string) {
  await act(async () => {
    fireEvent.changeText(screen.getByTestId('ds-input-field'), text);
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, SEARCH_DEBOUNCE_MS + 50));
  });
}

describe('SearchReposScreen (SRCH-01..11, CFG-04, NAV-05)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN SearchRepos renders THEN InputField and list region are present (SRCH-01)', async () => {
    await renderSearchStack(createInMemoryRepoRepository(sampleRepos));

    expect(screen.getByTestId('ds-input-field')).toBeTruthy();
    expect(screen.getByTestId('search-repos-list-region')).toBeTruthy();
  });

  it('WHEN debounced query is empty THEN idle state shows and no empty-results copy (SRCH-03)', async () => {
    await renderSearchStack(createInMemoryRepoRepository(sampleRepos));

    expect(screen.getByTestId('search-repos-idle')).toBeTruthy();
    expect(screen.queryByTestId('search-repos-empty')).toBeNull();
  });

  it('WHEN user types THEN input updates immediately and debounce feeds search (SRCH-02)', async () => {
    let searchCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: async (input) => {
        searchCalls += 1;
        return base.search(input);
      },
    };

    await renderSearchStack(repository);

    jest.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.changeText(screen.getByTestId('ds-input-field'), 'react');
      });
      expect(screen.getByTestId('ds-input-field')).toHaveProp('value', 'react');
      expect(searchCalls).toBe(0);

      await act(async () => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
      });
      expect(searchCalls).toBe(0);

      await act(async () => {
        jest.advanceTimersByTime(1);
      });
    } finally {
      jest.useRealTimers();
    }

    await waitFor(() => {
      expect(searchCalls).toBe(1);
    });
  });

  it('WHEN the first page is loading THEN a loading indicator shows (SRCH-04)', async () => {
    let resolveSearch!: (value: Awaited<ReturnType<RepoRepository['search']>>) => void;
    const repository: RepoRepository = {
      search: () =>
        new Promise((resolve) => {
          resolveSearch = resolve;
        }),
      getById: async () => {
        throw createAppError('not_found');
      },
      listIssues: async () => {
        throw createAppError('not_found');
      },
    };

    await renderSearchStack(repository);
    await typeAndWaitForDebounce('react');

    await waitFor(() => {
      expect(screen.getByTestId('search-repos-loading')).toBeTruthy();
    });

    await act(async () => {
      resolveSearch({
        items: [sampleRepos[0]!],
        page: 1,
        perPage: 20,
        hasNextPage: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });
  });

  it('WHEN results arrive THEN rows show name, owner, stars, language, description (SRCH-05, SRCH-11)', async () => {
    await renderSearchStack(createInMemoryRepoRepository(sampleRepos));
    await typeAndWaitForDebounce('react');

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });

    expect(screen.getByLabelText('facebook')).toBeTruthy();
    expect(screen.getByLabelText('1000 stars')).toBeTruthy();
    expect(screen.getAllByText('JavaScript').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeTruthy();
    expect(screen.getAllByTestId('ds-repo-item').length).toBeGreaterThanOrEqual(1);
  });

  it('WHEN scrolling near the end with hasNextPage THEN fetchNextPage runs (SRCH-06)', async () => {
    let searchCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: async (input) => {
        searchCalls += 1;
        return base.search({ ...input, perPage: 1 });
      },
    };

    await renderSearchStack(repository);
    await typeAndWaitForDebounce('e');

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });
    expect(searchCalls).toBe(1);

    await act(async () => {
      fireEvent(screen.getByTestId('search-repos-list'), 'onEndReached');
    });

    await waitFor(() => {
      expect(searchCalls).toBe(2);
    });
    await waitFor(() => {
      expect(screen.getByTestId('search-repos-list').props.data).toHaveLength(2);
    });
  });

  it('WHEN pulling to refresh THEN the list refetches (SRCH-07)', async () => {
    let searchCalls = 0;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: async (input) => {
        searchCalls += 1;
        return base.search(input);
      },
    };

    await renderSearchStack(repository);
    await typeAndWaitForDebounce('react');

    await waitFor(() => {
      expect(searchCalls).toBe(1);
      expect(screen.getByTestId('search-repos-list')).toBeTruthy();
    });

    await act(async () => {
      const list = screen.getByTestId('search-repos-list');
      list.props.refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(searchCalls).toBe(2);
    });
  });

  it('WHEN results are empty THEN an explicit empty state shows (SRCH-08)', async () => {
    await renderSearchStack(createInMemoryRepoRepository(sampleRepos));
    await typeAndWaitForDebounce('zzzz-no-match');

    await waitFor(() => {
      expect(screen.getByTestId('search-repos-empty')).toBeTruthy();
    });
  });

  it('WHEN search errors THEN mapAppErrorToMessage and Retry refetch (SRCH-09)', async () => {
    let shouldFail = true;
    const base = createInMemoryRepoRepository(sampleRepos);
    const repository: RepoRepository = {
      ...base,
      search: async (input) => {
        if (shouldFail) {
          throw createAppError('rate_limit');
        }
        return base.search(input);
      },
    };

    await renderSearchStack(repository);
    await typeAndWaitForDebounce('react');

    const expectedMessage = mapAppErrorToMessage(createAppError('rate_limit'));
    await waitFor(() => {
      expect(screen.getByTestId('search-repos-error')).toHaveTextContent(expectedMessage);
    });

    shouldFail = false;
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-repos-retry'));
    });

    await waitFor(() => {
      expect(screen.getByText('React')).toBeTruthy();
    });
  });

  it('WHEN a repository row is pressed THEN navigates to RepoDetails with opaque repo.id (NAV-05)', async () => {
    await renderSearchStack(createInMemoryRepoRepository(sampleRepos));
    await typeAndWaitForDebounce('react');

    await waitFor(() => {
      expect(screen.getAllByTestId('repo-list-item').length).toBeGreaterThanOrEqual(1);
    });

    await act(async () => {
      fireEvent.press(screen.getByText('React'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-full-name')).toHaveTextContent('facebook/react');
    });
  });

  it('WHEN SearchRepos renders THEN SessionSourceHeader exposes source toggle (RDI-08, CFG-04)', async () => {
    await renderSearchStack(createInMemoryRepoRepository());

    expect(screen.getByTestId('ds-source-header')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Alternar fonte de dados' })).toBeTruthy();
    expect(screen.queryByTestId('home-data-source-toggle')).toBeNull();
    expect(screen.queryByTestId('home-theme-toggle')).toBeNull();
    expect(screen.queryByTestId('config-data-source-toggle')).toBeNull();
    expect(screen.queryByTestId('config-theme-toggle')).toBeNull();
  });

  it('WHEN source toggle is pressed on Search THEN session dataSource flips (RDI-03)', async () => {
    await renderSearchStack(createInMemoryRepoRepository());
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Alternar fonte de dados' }));
    });

    expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab');
  });

  it('WHEN SearchRepos source is inspected THEN it uses presentation hooks only (SRCH-10)', () => {
    const source = readFileSync(join(__dirname, '../SearchReposScreen.tsx'), 'utf8');
    expect(source).not.toMatch(/@\/infrastructure\/(github|gitlab)/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).toMatch(/useSearchRepos/);
    expect(source).toMatch(/useDebouncedValue/);
    expect(source).toMatch(/mapAppErrorToMessage/);
    expect(source).toMatch(/SessionSourceHeader/);
    expect(source).not.toMatch(/useSessionPreferencesStore/);
  });

  it('WHEN SearchRepos list region is inspected THEN it uses Container not View (DSLIB-13)', () => {
    const source = readFileSync(join(__dirname, '../SearchReposScreen.tsx'), 'utf8');
    expect(source).toMatch(/<Container[^>]*testID="search-repos-list-region"/);
    expect(source).not.toMatch(/<View[^>]*testID="search-repos-list-region"/);
    expect(source).toMatch(/\bRefreshControl\b/);
  });

  it('WHEN SearchRepos list is inspected THEN it uses DS FlatList without RN FlatList (RITEM-12)', () => {
    const source = readFileSync(join(__dirname, '../SearchReposScreen.tsx'), 'utf8');
    expect(source).toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]@ds\/molecules['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]react-native['"]/);
    expect(source).not.toMatch(/ItemSeparatorComponent/);
    expect(source).not.toMatch(/initialNumToRender/);
    expect(source).not.toMatch(/onEndReachedThreshold/);
  });

  it('WHEN SearchRepos list region wraps the list THEN it does not double-apply horizontal px (RITEM-12)', () => {
    const source = readFileSync(join(__dirname, '../SearchReposScreen.tsx'), 'utf8');
    expect(source).toMatch(/testID="search-repos-list-region"/);
    expect(source).toMatch(/px=\{showingList \? undefined : ['"]md['"]\}/);
    expect(source).not.toMatch(
      /testID="search-repos-list-region"[\s\S]*?px=['"]md['"][\s\S]*?\{listBody\}/,
    );
  });
});
