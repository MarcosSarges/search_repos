export type TabsParamList = {
  Search: undefined;
  Favoritos: undefined;
  Explore: undefined;
  Config: undefined;
};

export type SearchStackParamList = {
  SearchRepos: undefined;
  RepoDetails: { repoId: string };
  RepoIssues: { repoId: string };
};
