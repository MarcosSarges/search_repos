import type { NavigatorScreenParams } from '@react-navigation/native';

export type SearchStackParamList = {
  SearchRepos: undefined;
  RepoDetails: { repoId: string };
  RepoIssues: { repoId: string };
};

export type TabsParamList = {
  Search: NavigatorScreenParams<SearchStackParamList> | undefined;
  Favoritos: undefined;
  Explore: undefined;
  Config: undefined;
};
