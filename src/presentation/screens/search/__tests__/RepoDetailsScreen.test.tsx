import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { createAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryFavoritesRepository, createInMemoryRepoRepository } from '@/infrastructure';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { setAppContainerTestFavoritesRepository } from '@/presentation/hooks/use-app-container';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { useFavoritesStore } from '@/presentation/stores';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { RepoDetailsScreen } from '../RepoDetailsScreen';
import { RepoIssuesScreen } from '../RepoIssuesScreen';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

const Stack = createNativeStackNavigator<SearchStackParamList>();

const sampleRepo: Repo = {
  id: 'facebook/react',
  name: 'react',
  fullName: 'facebook/react',
  description: 'A JavaScript library for building user interfaces',
  stars: 1000,
  forks: 200,
  watchers: 1500,
  language: 'JavaScript',
  ownerName: 'facebook',
  ownerAvatarUrl: 'https://avatars.example/facebook.png',
  htmlUrl: 'https://github.com/facebook/react',
};

const minimalRepo: Repo = {
  id: 'owner/minimal',
  name: 'minimal',
  fullName: 'owner/minimal',
  stars: 0,
  forks: 0,
  watchers: 0,
  ownerName: 'owner',
  htmlUrl: 'https://github.com/owner/minimal',
};

const whitespaceDescriptionRepo: Repo = {
  ...minimalRepo,
  id: 'owner/whitespace',
  name: 'whitespace',
  fullName: 'owner/whitespace',
  description: '   \n\t  ',
  htmlUrl: 'https://github.com/owner/whitespace',
};

async function renderDetails(
  repoId: string,
  repository?: RepoRepository,
  favoritesRepository = createInMemoryFavoritesRepository(),
) {
  setAppContainerTestFavoritesRepository(favoritesRepository);
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="RepoDetails"
          component={RepoDetailsScreen}
          initialParams={{ repoId }}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="RepoIssues" component={RepoIssuesScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
    { repository, dataSource: 'github', favoritesRepository },
  );
}

describe('RepoDetailsScreen (DIC-01, DIC-02, DIC-03)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
    useFavoritesStore.setState({ items: [], hasHydrated: false });
    setAppContainerTestFavoritesRepository(createInMemoryFavoritesRepository());
  });

  afterEach(() => {
    setAppContainerTestFavoritesRepository(undefined);
  });

  it('WHEN RepoDetails loads THEN it shows loading until data is ready', async () => {
    let resolveGet!: (value: Repo) => void;
    const repository: RepoRepository = {
      search: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
      getById: () =>
        new Promise((resolve) => {
          resolveGet = resolve;
        }),
      listIssues: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
    };

    await renderDetails('facebook/react', repository);

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-loading')).toBeTruthy();
    });

    await act(async () => {
      resolveGet(sampleRepo);
    });

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeTruthy();
    });
  });

  it('WHEN data arrives THEN hero shows avatar lg, owner, fullName and three iconed metrics', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-full-name')).toHaveTextContent('facebook/react');
    });

    expect(screen.getByText('facebook')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByTestId('repo-details-content')).toBeTruthy();

    expect(screen.getByLabelText('1000 stars')).toBeTruthy();
    expect(screen.getByLabelText('200 forks')).toBeTruthy();
    expect(screen.getByLabelText('1500 watchers')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('1500')).toBeTruthy();

    expect(screen.getByText('JavaScript')).toBeTruthy();
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeTruthy();
    expect(screen.getByText('Abrir no site')).toBeTruthy();
    expect(screen.getByTestId('repo-details-issues-cta')).toBeTruthy();
  });

  it('WHEN RepoDetailsScreen source is inspected THEN metrics use star, git-network, and eye-outline', () => {
    const source = readFileSync(join(__dirname, '../RepoDetailsScreen.tsx'), 'utf8');
    expect(source).toMatch(/name=["']star["']/);
    expect(source).toMatch(/name=["']git-network["']/);
    expect(source).toMatch(/name=["']eye-outline["']/);
  });

  it('WHEN description is missing THEN description block is omitted', async () => {
    await renderDetails('owner/minimal', createInMemoryRepoRepository([minimalRepo]));

    await waitFor(() => {
      expect(screen.getByText('owner/minimal')).toBeTruthy();
    });

    expect(screen.queryByTestId('repo-details-description')).toBeNull();
  });

  it('WHEN description is whitespace-only THEN description block is omitted', async () => {
    await renderDetails(
      'owner/whitespace',
      createInMemoryRepoRepository([whitespaceDescriptionRepo]),
    );

    await waitFor(() => {
      expect(screen.getByText('owner/whitespace')).toBeTruthy();
    });

    expect(screen.queryByTestId('repo-details-description')).toBeNull();
  });

  it('WHEN Abrir no site is pressed THEN Linking.openURL is called with htmlUrl', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByText('Abrir no site')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText('Abrir no site'));
    });

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/facebook/react');
  });

  it('WHEN Issues CTA is pressed THEN navigates to RepoIssues with same repoId', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-issues-cta')).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-details-issues-cta'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('repo-issues-repo-link')).toHaveTextContent('facebook/react');
    });
  });

  it('WHEN query errors THEN mapAppErrorToMessage and Retry refetch', async () => {
    let shouldFail = true;
    const base = createInMemoryRepoRepository([sampleRepo]);
    const repository: RepoRepository = {
      ...base,
      getById: async (id) => {
        if (shouldFail) {
          throw createAppError('rate_limit');
        }
        return base.getById(id);
      },
    };

    await renderDetails('facebook/react', repository);

    const expectedMessage = mapAppErrorToMessage(createAppError('rate_limit'));
    await waitFor(() => {
      expect(screen.getByTestId('repo-details-error')).toHaveTextContent(expectedMessage);
    });

    shouldFail = false;
    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-details-retry'));
    });

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeTruthy();
    });
  });

  it('WHEN Details renders THEN StackBackHeader with Voltar is present (no source toggle)', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByText('Detalhes')).toBeTruthy();
    });

    expect(screen.getByTestId('ds-back-header')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
    expect(screen.queryByTestId('ds-source-header-toggle')).toBeNull();
  });

  it('WHEN RepoDetailsScreen source is inspected THEN it uses hooks only and no RepoDetails organism', () => {
    const source = readFileSync(join(__dirname, '../RepoDetailsScreen.tsx'), 'utf8');
    expect(source).toMatch(/useRepoDetails/);
    expect(source).toMatch(/StackBackHeader/);
    expect(source).not.toMatch(/SessionSourceHeader/);
    expect(source).toMatch(/mapAppErrorToMessage/);
    expect(source).not.toMatch(/@\/infrastructure\/(github|gitlab)/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/useSessionPreferencesStore/);
    expect(source).not.toMatch(/organisms\/RepoDetails/);
    expect(source).not.toMatch(/\bimport\s*\{[^}]*\bRepoDetails\b/);
    expect(existsSync(join(__dirname, '../../../../packages/ds/organisms/RepoDetails'))).toBe(
      false,
    );
  });

  describe('favorite toggle (FAV-06/07/08)', () => {
    it('WHEN loading THEN favorite control is absent', async () => {
      const repository: RepoRepository = {
        search: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
        getById: () => new Promise(() => {}),
        listIssues: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
        listTrending: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
      };

      await renderDetails('facebook/react', repository);

      await waitFor(() => {
        expect(screen.getByTestId('repo-details-loading')).toBeTruthy();
      });
      expect(screen.queryByTestId('repo-details-favorite')).toBeNull();
    });

    it('WHEN error THEN favorite control is absent', async () => {
      const repository: RepoRepository = {
        search: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
        getById: async () => {
          throw createAppError('rate_limit');
        },
        listIssues: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
        listTrending: async () => ({ items: [], page: 1, perPage: 20, hasNextPage: false }),
      };

      await renderDetails('facebook/react', repository);

      await waitFor(() => {
        expect(screen.getByTestId('repo-details-error')).toBeTruthy();
      });
      expect(screen.queryByTestId('repo-details-favorite')).toBeNull();
    });

    it('WHEN data loaded and not favorited THEN shows Favoritar and toggle adds snapshot', async () => {
      const favoritesRepository = createInMemoryFavoritesRepository();
      await renderDetails(
        'facebook/react',
        createInMemoryRepoRepository([sampleRepo]),
        favoritesRepository,
      );

      await waitFor(() => {
        expect(screen.getByTestId('repo-details-favorite')).toBeTruthy();
      });
      expect(screen.getByLabelText('Favoritar')).toBeTruthy();
      expect(screen.getByTestId('repo-details-favorite-outline')).toBeTruthy();
      expect(screen.queryByTestId('repo-details-favorite-filled')).toBeNull();
      expect(useFavoritesStore.getState().isFavorite('github', 'facebook/react')).toBe(false);

      await act(async () => {
        fireEvent.press(screen.getByTestId('repo-details-favorite'));
      });

      await waitFor(() => {
        expect(useFavoritesStore.getState().isFavorite('github', 'facebook/react')).toBe(true);
        expect(screen.getByTestId('repo-details-favorite-filled')).toBeTruthy();
        expect(screen.queryByTestId('repo-details-favorite-outline')).toBeNull();
      });
      const item = useFavoritesStore.getState().items.find((f) => f.id === 'facebook/react');
      expect(item).toMatchObject({
        id: 'facebook/react',
        source: 'github',
        name: 'react',
        fullName: 'facebook/react',
        ownerName: 'facebook',
        stars: 1000,
      });
    });

    it('WHEN already favorited THEN shows Remover dos favoritos and toggle removes', async () => {
      const favoritesRepository = createInMemoryFavoritesRepository([
        {
          id: 'facebook/react',
          source: 'github',
          name: 'react',
          fullName: 'facebook/react',
          ownerName: 'facebook',
          stars: 1000,
          favoritedAt: 1,
        },
      ]);

      await renderDetails(
        'facebook/react',
        createInMemoryRepoRepository([sampleRepo]),
        favoritesRepository,
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Remover dos favoritos')).toBeTruthy();
        expect(screen.getByTestId('repo-details-favorite-filled')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(screen.getByTestId('repo-details-favorite'));
      });

      await waitFor(() => {
        expect(useFavoritesStore.getState().isFavorite('github', 'facebook/react')).toBe(false);
        expect(screen.getByTestId('repo-details-favorite-outline')).toBeTruthy();
        expect(screen.queryByTestId('repo-details-favorite-filled')).toBeNull();
      });
    });
  });
});
