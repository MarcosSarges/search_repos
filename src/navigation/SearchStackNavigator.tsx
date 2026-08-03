import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { SearchStackParamList } from '@/navigation/types';
import { RepoDetailsScreen } from '@/screens/search/RepoDetailsScreen';
import { RepoIssuesScreen } from '@/screens/search/RepoIssuesScreen';
import { SearchReposScreen } from '@/screens/search/SearchReposScreen';

const Stack = createNativeStackNavigator<SearchStackParamList>();

export function SearchStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SearchRepos"
        component={SearchReposScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RepoDetails"
        component={RepoDetailsScreen}
        options={{ title: 'Detalhes' }}
      />
      <Stack.Screen name="RepoIssues" component={RepoIssuesScreen} options={{ title: 'Issues' }} />
    </Stack.Navigator>
  );
}
