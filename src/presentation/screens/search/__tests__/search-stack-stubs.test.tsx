import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createInMemoryRepoRepository } from '@/infrastructure';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { RepoDetailsScreen } from '../RepoDetailsScreen';
import { RepoIssuesScreen } from '../RepoIssuesScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

describe('RepoDetailsScreen / RepoIssuesScreen stubs (NAV-06..08)', () => {
  it('WHEN RepoDetails opens with repoId THEN Issues CTA navigates with same repoId', async () => {
    const repoId = 'facebook/react';
    const repository = createInMemoryRepoRepository([
      {
        id: repoId,
        name: 'react',
        fullName: 'facebook/react',
        stars: 1,
        forks: 0,
        watchers: 1,
        ownerName: 'facebook',
        htmlUrl: 'https://github.com/facebook/react',
      },
    ]);

    await render(
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

    await waitFor(() => {
      expect(screen.getByTestId('repo-details-full-name')).toHaveTextContent(repoId);
    });

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
          <Stack.Screen name="RepoIssues" component={RepoIssuesScreen} initialParams={{ repoId }} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    expect(screen.getByTestId('repo-issues-repo-id')).toHaveTextContent(repoId);
  });
});
