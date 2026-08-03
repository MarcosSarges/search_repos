import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { createAppError, type Issue, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { RepoIssuesScreen } from '../RepoIssuesScreen';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator<SearchStackParamList>();

const sampleRepo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  stars: 1000,
  forks: 200,
  watchers: 1000,
  language: 'JavaScript',
  ownerName: 'facebook',
  htmlUrl: 'https://github.com/facebook/react',
};

const sampleIssues: Issue[] = [
  {
    id: '1',
    number: 1,
    title: 'First issue',
    authorName: 'alice',
    labels: [{ id: 'bug', name: 'bug', color: 'ff0000' }],
    createdAt: '2026-08-03T10:00:00.000Z',
    updatedAt: '2026-08-03T11:00:00.000Z',
    state: 'open',
    comments: 2,
    htmlUrl: 'https://github.com/facebook/react/issues/1',
  },
  {
    id: '2',
    number: 2,
    title: 'Second issue',
    authorName: 'bob',
    labels: [],
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T11:00:00.000Z',
    state: 'closed',
    comments: 0,
    htmlUrl: 'https://github.com/facebook/react/issues/2',
  },
];

async function renderIssues(repoId: string, repository?: RepoRepository) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="RepoIssues"
          component={RepoIssuesScreen}
          initialParams={{ repoId }}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
    { repository, dataSource: 'github' },
  );
}

describe('RepoIssuesScreen (RDI-06, RDI-07)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
  });

  it('WHEN RepoIssues loads THEN it shows loading for the first page', async () => {
    let resolveList!: (value: Awaited<ReturnType<RepoRepository['listIssues']>>) => void;
    const repository: RepoRepository = {
      search: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
      getById: async () => sampleRepo,
      listIssues: () =>
        new Promise((resolve) => {
          resolveList = resolve;
        }),
    };

    await renderIssues('facebook/react', repository);

    await waitFor(() => {
      expect(screen.getByTestId('repo-issues-loading')).toBeTruthy();
    });

    await act(async () => {
      resolveList({ items: [sampleIssues[0]!], page: 1, perPage: 20, hasNextPage: false });
    });

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeTruthy();
    });
  });

  it('WHEN issues arrive THEN rows show title Hyperlink, labels, author, and relative updatedAt via IssueItem', async () => {
    await renderIssues(
      'facebook/react',
      createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues }),
    );

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeTruthy();
    });

    expect(screen.getByText('bug')).toBeTruthy();
    expect(screen.getByText('alice')).toBeTruthy();
    expect(screen.getByText('#1')).toBeTruthy();
    expect(screen.getByText('Aberta')).toBeTruthy();
    expect(screen.getByText('Second issue')).toBeTruthy();
    expect(screen.getByText('bob')).toBeTruthy();
    expect(screen.getByText('#2')).toBeTruthy();
    expect(screen.getByText('Fechada')).toBeTruthy();
    expect(screen.getAllByTestId('ds-issue-item').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId('ds-issue-item-date').length).toBeGreaterThanOrEqual(2);
  });

  it('WHEN details are ready THEN repo Hyperlink opens htmlUrl', async () => {
    await renderIssues(
      'facebook/react',
      createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('repo-issues-repo-link')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-issues-repo-link'));
    });

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/facebook/react');
  });

  it('WHEN scrolling near the end with hasNextPage THEN fetchNextPage runs', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues });
    const repository: RepoRepository = {
      ...base,
      listIssues: async (input) => {
        listCalls += 1;
        return base.listIssues({ ...input, perPage: 1 });
      },
    };

    await renderIssues('facebook/react', repository);

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeTruthy();
    });
    expect(listCalls).toBe(1);

    await act(async () => {
      fireEvent(screen.getByTestId('repo-issues-list'), 'onEndReached');
    });

    await waitFor(() => {
      expect(listCalls).toBe(2);
    });
    await waitFor(() => {
      expect(screen.getByText('Second issue')).toBeTruthy();
    });
  });

  it('WHEN pulling to refresh THEN the list refetches', async () => {
    let listCalls = 0;
    const base = createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues });
    const repository: RepoRepository = {
      ...base,
      listIssues: async (input) => {
        listCalls += 1;
        return base.listIssues(input);
      },
    };

    await renderIssues('facebook/react', repository);

    await waitFor(() => {
      expect(listCalls).toBe(1);
      expect(screen.getByTestId('repo-issues-list')).toBeTruthy();
    });

    await act(async () => {
      const list = screen.getByTestId('repo-issues-list');
      list.props.refreshControl.props.onRefresh();
    });

    await waitFor(() => {
      expect(listCalls).toBe(2);
    });
  });

  it('WHEN there are zero issues THEN an explicit empty state shows', async () => {
    await renderIssues(
      'facebook/react',
      createInMemoryRepoRepository([sampleRepo], { 'facebook/react': [] }),
    );

    await waitFor(() => {
      expect(screen.getByTestId('repo-issues-empty')).toBeTruthy();
    });
  });

  it('WHEN query errors THEN mapAppErrorToMessage and Retry refetch', async () => {
    let shouldFail = true;
    const base = createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues });
    const repository: RepoRepository = {
      ...base,
      listIssues: async (input) => {
        if (shouldFail) {
          throw createAppError('rate_limit');
        }
        return base.listIssues(input);
      },
    };

    await renderIssues('facebook/react', repository);

    const expectedMessage = mapAppErrorToMessage(createAppError('rate_limit'));
    await waitFor(() => {
      expect(screen.getByTestId('repo-issues-error')).toHaveTextContent(expectedMessage);
    });

    shouldFail = false;
    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-issues-retry'));
    });

    await waitFor(() => {
      expect(screen.getByText('First issue')).toBeTruthy();
    });
  });

  it('WHEN Issues renders THEN StackBackHeader with Voltar is present (no source toggle)', async () => {
    await renderIssues(
      'facebook/react',
      createInMemoryRepoRepository([sampleRepo], { 'facebook/react': sampleIssues }),
    );

    await waitFor(() => {
      expect(screen.getByText('Issues')).toBeTruthy();
    });

    expect(screen.getByTestId('ds-back-header')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
    expect(screen.queryByTestId('ds-source-header-toggle')).toBeNull();
  });

  it('WHEN RepoIssuesScreen source is inspected THEN it uses hooks only', () => {
    const source = readFileSync(join(__dirname, '../RepoIssuesScreen.tsx'), 'utf8');
    expect(source).toMatch(/useRepoIssues/);
    expect(source).toMatch(/useRepoDetails/);
    expect(source).toMatch(/StackBackHeader/);
    expect(source).not.toMatch(/SessionSourceHeader/);
    expect(source).toMatch(/IssueListItem/);
    expect(source).not.toMatch(/@\/infrastructure\/(github|gitlab)/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/useSessionPreferencesStore/);
  });

  it('WHEN RepoIssues list is inspected THEN it uses DS FlatList without RN FlatList (RITEM-12)', () => {
    const source = readFileSync(join(__dirname, '../RepoIssuesScreen.tsx'), 'utf8');
    expect(source).toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]@ds\/molecules['"]/);
    expect(source).not.toMatch(/import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*['"]react-native['"]/);
    expect(source).not.toMatch(/ItemSeparatorComponent/);
    expect(source).not.toMatch(/initialNumToRender/);
    expect(source).not.toMatch(/onEndReachedThreshold/);
  });

  it('WHEN RepoIssues list is shown THEN it is not wrapped in a parent Container with px (RITEM-12)', () => {
    const source = readFileSync(join(__dirname, '../RepoIssuesScreen.tsx'), 'utf8');
    expect(source).toMatch(
      /showingList \? listBody : <Container px=['"]md['"]>\{listBody\}<\/Container>/,
    );
    expect(source).not.toMatch(/<Container[^>]*px=['"]md['"][^>]*>[\s\S]*?<FlatList/);
  });
});
