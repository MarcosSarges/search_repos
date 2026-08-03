import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { createInMemoryRepoRepository } from '@/infrastructure';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { act, fireEvent, render, screen, waitFor } from '@/test';

import { RepoDetailsScreen } from '../RepoDetailsScreen';
import { RepoIssuesScreen } from '../RepoIssuesScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

describe('RepoDetails → RepoIssues navigation (NAV-06..08)', () => {
  it('WHEN RepoDetails Issues CTA is pressed THEN RepoIssues opens for the same repoId', async () => {
    const repoId = 'facebook/react';
    const repository = createInMemoryRepoRepository(
      [
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
      ],
      {
        [repoId]: [
          {
            id: '1',
            number: 1,
            title: 'Sample issue',
            authorName: 'dev',
            labels: [],
            createdAt: '2026-08-01T00:00:00.000Z',
            updatedAt: '2026-08-01T12:00:00.000Z',
            state: 'open',
            comments: 0,
            htmlUrl: 'https://github.com/facebook/react/issues/1',
          },
        ],
      },
    );

    await render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="RepoDetails"
            component={RepoDetailsScreen}
            initialParams={{ repoId }}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RepoIssues"
            component={RepoIssuesScreen}
            options={{ headerShown: false }}
          />
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

    await waitFor(() => {
      expect(screen.getByText('Issues')).toBeTruthy();
      expect(screen.getByTestId('repo-issues-repo-link')).toBeTruthy();
      expect(screen.getByText('Sample issue')).toBeTruthy();
    });
  });
});
