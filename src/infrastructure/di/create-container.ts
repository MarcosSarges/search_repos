import {
  createGetRepoDetails,
  createIsFavorite,
  createListFavorites,
  createListFavoritesBySource,
  createListRepoIssues,
  createListTrendingRepos,
  createRemoveFavorite,
  createSearchRepos,
  createToggleFavorite,
  type DataSource,
  type GetRepoDetails,
  type IsFavorite,
  type ListFavorites,
  type ListFavoritesBySource,
  type ListRepoIssues,
  type ListTrendingRepos,
  type RemoveFavorite,
  type SearchRepos,
  type ToggleFavorite,
} from '@/application';
import type { FavoritesRepository, RepoRepository } from '@/domain';

import { createAsyncStorageFavoritesRepository } from '../repositories/async-storage-favorites-repository';
import { resolveRepository } from './resolve-repository';

export type ProviderTokens = {
  github?: string;
  gitlab?: string;
};

export type CreateContainerDeps = {
  dataSource: DataSource;
  repository?: RepoRepository;
  favoritesRepository?: FavoritesRepository;
  /** Optional credentials bag — DI selects token for active dataSource. */
  tokens?: ProviderTokens;
};

export type AppContainer = {
  searchRepos: SearchRepos;
  getRepoDetails: GetRepoDetails;
  listRepoIssues: ListRepoIssues;
  listTrendingRepos: ListTrendingRepos;
  listFavorites: ListFavorites;
  listFavoritesBySource: ListFavoritesBySource;
  toggleFavorite: ToggleFavorite;
  removeFavorite: RemoveFavorite;
  isFavorite: IsFavorite;
};

export function createContainer(deps: CreateContainerDeps): AppContainer {
  const token = deps.tokens?.[deps.dataSource];
  const repository = deps.repository ?? resolveRepository(deps.dataSource, { token });
  const favoritesRepository = deps.favoritesRepository ?? createAsyncStorageFavoritesRepository();

  return {
    searchRepos: createSearchRepos(repository),
    getRepoDetails: createGetRepoDetails(repository),
    listRepoIssues: createListRepoIssues(repository),
    listTrendingRepos: createListTrendingRepos(repository),
    listFavorites: createListFavorites(favoritesRepository),
    listFavoritesBySource: createListFavoritesBySource(favoritesRepository),
    toggleFavorite: createToggleFavorite(favoritesRepository),
    removeFavorite: createRemoveFavorite(favoritesRepository),
    isFavorite: createIsFavorite(favoritesRepository),
  };
}
