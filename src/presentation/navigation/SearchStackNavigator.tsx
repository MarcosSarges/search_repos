import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { SearchStackParamList } from '@/presentation/navigation/types';
import { RepoDetailsScreen } from '@/presentation/screens/search/RepoDetailsScreen';
import { RepoIssuesScreen } from '@/presentation/screens/search/RepoIssuesScreen';
import { SearchReposScreen } from '@/presentation/screens/search/SearchReposScreen';

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
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RepoIssues"
        component={RepoIssuesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
