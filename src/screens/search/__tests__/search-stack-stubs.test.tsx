import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { SearchStackParamList } from '@/navigation/types';
import { act, fireEvent, render, screen } from '@/test';

import { RepoDetailsScreen } from '../RepoDetailsScreen';
import { RepoIssuesScreen } from '../RepoIssuesScreen';
import { SearchReposScreen } from '../SearchReposScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

describe('SearchReposScreen placeholder (NAV-04)', () => {
  it('WHEN SearchRepos placeholder renders THEN title and testID are present', async () => {
    await render(<SearchReposScreen />);
    expect(screen.getByText('Search')).toBeTruthy();
    expect(screen.getByTestId('search-repos-placeholder')).toBeTruthy();
  });
});

describe('RepoDetailsScreen / RepoIssuesScreen stubs (NAV-06..08)', () => {
  it('WHEN RepoDetails opens with repoId THEN it shows that id and Issues CTA navigates with same repoId', async () => {
    const repoId = 'facebook/react';

    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="RepoDetails"
            component={RepoDetailsScreen}
            initialParams={{ repoId }}
          />
          <Stack.Screen name="RepoIssues" component={RepoIssuesScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    expect(screen.getByTestId('repo-details-repo-id')).toHaveTextContent(repoId);

    await act(async () => {
      fireEvent.press(screen.getByTestId('repo-details-issues-cta'));
    });

    expect(screen.getByTestId('repo-issues-repo-id')).toHaveTextContent(repoId);
  });

  it('WHEN RepoIssues opens with repoId THEN it shows that id', async () => {
    const repoId = 'vercel/next.js';

    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="RepoIssues"
            component={RepoIssuesScreen}
            initialParams={{ repoId }}
          />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    expect(screen.getByTestId('repo-issues-repo-id')).toHaveTextContent(repoId);
  });
});
