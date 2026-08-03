import type { DataSource } from '../types/data-source';
import type { Favorite, Repo } from '@/domain';

/** Maps a domain Repo + active DataSource into a Favorite snapshot. */
export function createFavoriteFromRepo(repo: Repo, dataSource: DataSource): Favorite {
  const favorite: Favorite = {
    id: repo.id,
    source: dataSource,
    name: repo.name,
    fullName: repo.fullName,
    ownerName: repo.ownerName,
    stars: repo.stars,
    favoritedAt: Date.now(),
  };
  if (repo.ownerAvatarUrl !== undefined) {
    favorite.ownerAvatarUrl = repo.ownerAvatarUrl;
  }
  if (repo.description !== undefined) {
    favorite.description = repo.description;
  }
  if (repo.language !== undefined) {
    favorite.language = repo.language;
  }
  return favorite;
}
