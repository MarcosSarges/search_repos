import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { createAppError, type Repo, type RepoRepository } from '@/domain';
import { createInMemoryRepoRepository } from '@/infrastructure';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import type { SearchStackParamList } from '@/presentation/navigation/types';
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

async function renderDetails(repoId: string, repository?: RepoRepository) {
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
    { repository, dataSource: 'github' },
  );
}

describe('RepoDetailsScreen (RDI-05)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
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

  it('WHEN data arrives THEN it shows §4.3 fields from Fake repo', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeTruthy();
    });

    expect(screen.getByText('facebook')).toBeTruthy();
    expect(screen.getByTestId('ds-avatar')).toBeTruthy();
    expect(screen.getByText('1000')).toBeTruthy();
    expect(screen.getByText('200')).toBeTruthy();
    expect(screen.getByText('1500')).toBeTruthy();
    expect(screen.getByText('JavaScript')).toBeTruthy();
    expect(screen.getByText('A JavaScript library for building user interfaces')).toBeTruthy();
    expect(screen.getByText('Abrir no site')).toBeTruthy();
    expect(screen.getByTestId('repo-details-issues-cta')).toBeTruthy();
  });

  it('WHEN description is missing THEN description block is omitted', async () => {
    await renderDetails('owner/minimal', createInMemoryRepoRepository([minimalRepo]));

    await waitFor(() => {
      expect(screen.getByText('owner/minimal')).toBeTruthy();
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

  it('WHEN Details renders THEN SessionSourceHeader and Voltar leading are present', async () => {
    await renderDetails('facebook/react', createInMemoryRepoRepository([sampleRepo]));

    await waitFor(() => {
      expect(screen.getByText('Detalhes')).toBeTruthy();
    });

    expect(screen.getByTestId('ds-source-header')).toBeTruthy();
    expect(screen.getByLabelText('Voltar')).toBeTruthy();
  });

  it('WHEN RepoDetailsScreen source is inspected THEN it uses hooks only (RDI-05)', () => {
    const source = readFileSync(join(__dirname, '../RepoDetailsScreen.tsx'), 'utf8');
    expect(source).toMatch(/useRepoDetails/);
    expect(source).toMatch(/SessionSourceHeader/);
    expect(source).toMatch(/mapAppErrorToMessage/);
    expect(source).not.toMatch(/@\/infrastructure\/(github|gitlab)/);
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toMatch(/useSessionPreferencesStore/);
  });
});
