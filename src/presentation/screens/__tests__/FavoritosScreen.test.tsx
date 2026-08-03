import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import type { FavoriteSnapshot } from '@/presentation/stores';
import { useFavoritesStore, useSessionPreferencesStore } from '@/presentation/stores';
import type { SearchStackParamList, TabsParamList } from '@/presentation/navigation/types';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { FavoritosScreen } from '../FavoritosScreen';

const Tabs = createBottomTabNavigator<TabsParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();

function SearchStub() {
  return <Text testID="search-tab-stub">Search stub</Text>;
}

function SearchStackStub() {
  return (
    <SearchStack.Navigator>
      <SearchStack.Screen name="SearchRepos" component={SearchStub} />
      <SearchStack.Screen
        name="RepoDetails"
        component={({ route }) => (
          <Text testID="repo-details-stub">{`details:${route.params.repoId}`}</Text>
        )}
      />
    </SearchStack.Navigator>
  );
}

function ExploreStub() {
  return <Text testID="explore-tab-stub">Explore stub</Text>;
}

async function renderFavoritosTab() {
  return render(
    <NavigationContainer>
      <Tabs.Navigator screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="Favoritos" component={FavoritosScreen} />
        <Tabs.Screen name="Search" component={SearchStackStub} />
        <Tabs.Screen name="Explore" component={ExploreStub} />
        <Tabs.Screen name="Config" component={() => <Text>Config</Text>} />
      </Tabs.Navigator>
    </NavigationContainer>,
    { dataSource: 'github' },
  );
}

function seedFavorite(
  partial: Partial<FavoriteSnapshot> & Pick<FavoriteSnapshot, 'id' | 'dataSource'>,
) {
  useFavoritesStore.getState().toggleFavorite({
    name: partial.name ?? partial.id,
    fullName: partial.fullName ?? partial.id,
    ownerName: partial.ownerName ?? 'owner',
    stars: partial.stars ?? 1,
    favoritedAt: partial.favoritedAt ?? Date.now(),
    ...partial,
  });
}

describe('FavoritosScreen (FAV-03/04/10/12/13)', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ items: [], hasHydrated: true });
  });

  it('WHEN not hydrated THEN does not show empty CTA (no false empty)', async () => {
    useFavoritesStore.setState({ items: [], hasHydrated: false });
    await renderFavoritosTab();

    expect(screen.getByTestId('favoritos-screen')).toBeTruthy();
    expect(screen.getByTestId('favoritos-loading')).toBeTruthy();
    expect(screen.queryByTestId('favoritos-empty')).toBeNull();
    expect(screen.queryByTestId('favoritos-cta-search')).toBeNull();
  });

  it('WHEN both sources empty after hydrate THEN shows PT-BR empty and Search + Explore CTAs', async () => {
    await renderFavoritosTab();

    expect(screen.getAllByText('Favoritos').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('ds-source-header-toggle')).toBeTruthy();
    expect(screen.getByTestId('favoritos-empty')).toHaveTextContent(/Você ainda não tem favoritos/);
    expect(screen.getByTestId('favoritos-cta-search')).toBeTruthy();
    expect(screen.getByTestId('favoritos-cta-explore')).toBeTruthy();
  });

  it('WHEN empty Search CTA is pressed THEN navigates to Search tab', async () => {
    await renderFavoritosTab();

    await act(async () => {
      fireEvent.press(screen.getByTestId('favoritos-cta-search'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('search-tab-stub')).toBeTruthy();
    });
  });

  it('WHEN empty Explore CTA is pressed THEN navigates to Explore tab', async () => {
    await renderFavoritosTab();

    await act(async () => {
      fireEvent.press(screen.getByTestId('favoritos-cta-explore'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('explore-tab-stub')).toBeTruthy();
    });
  });

  it('WHEN favorites exist THEN renders dual sections without interleaving and omits empty source', async () => {
    seedFavorite({
      id: 'gh/one',
      dataSource: 'github',
      name: 'one',
      fullName: 'gh/one',
      favoritedAt: 20,
    });
    seedFavorite({
      id: 'gl/two',
      dataSource: 'gitlab',
      name: 'two',
      fullName: 'gl/two',
      favoritedAt: 10,
    });
    seedFavorite({
      id: 'gh/three',
      dataSource: 'github',
      name: 'three',
      fullName: 'gh/three',
      favoritedAt: 30,
    });

    await renderFavoritosTab();

    expect(screen.getByTestId('favoritos-list')).toBeTruthy();
    expect(screen.getByTestId('favoritos-section-github')).toBeTruthy();
    expect(screen.getByTestId('favoritos-section-gitlab')).toBeTruthy();
    expect(screen.getByText('GitHub')).toBeTruthy();
    expect(screen.getByText('GitLab')).toBeTruthy();
    expect(screen.getAllByTestId('ds-repo-item')).toHaveLength(3);
    expect(screen.queryByTestId('favoritos-empty')).toBeNull();
  });

  it('WHEN only one source has items THEN the empty source section is omitted', async () => {
    seedFavorite({ id: 'gh/only', dataSource: 'github', name: 'only', fullName: 'gh/only' });

    await renderFavoritosTab();

    expect(screen.getByTestId('favoritos-section-github')).toBeTruthy();
    expect(screen.queryByTestId('favoritos-section-gitlab')).toBeNull();
  });

  it('WHEN a row is tapped THEN setDataSource if needed and navigates to RepoDetails', async () => {
    seedFavorite({
      id: 'gitlab-org/gitlab',
      dataSource: 'gitlab',
      name: 'gitlab',
      fullName: 'gitlab-org/gitlab',
    });
    expect(useSessionPreferencesStore.getState().dataSource).toBe('github');

    await renderFavoritosTab();

    await act(async () => {
      fireEvent.press(screen.getByTestId('favoritos-row-gitlab-gitlab-org/gitlab'));
    });

    expect(useSessionPreferencesStore.getState().dataSource).toBe('gitlab');
    await waitFor(() => {
      expect(screen.getByTestId('repo-details-stub')).toHaveTextContent(
        'details:gitlab-org/gitlab',
      );
    });
  });

  it('WHEN Remover action is pressed THEN removes that favorite from store and UI (FAV-11)', async () => {
    seedFavorite({
      id: 'gh/one',
      dataSource: 'github',
      name: 'one',
      fullName: 'gh/one',
    });
    seedFavorite({
      id: 'gh/two',
      dataSource: 'github',
      name: 'two',
      fullName: 'gh/two',
    });

    await renderFavoritosTab();

    expect(screen.getByTestId('favoritos-row-github-gh/one')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByTestId('favoritos-remove-github-gh/one'));
    });

    expect(useFavoritesStore.getState().isFavorite('github', 'gh/one')).toBe(false);
    expect(useFavoritesStore.getState().isFavorite('github', 'gh/two')).toBe(true);
    expect(screen.queryByTestId('favoritos-row-github-gh/one')).toBeNull();
    expect(screen.getByTestId('favoritos-row-github-gh/two')).toBeTruthy();
  });
});
