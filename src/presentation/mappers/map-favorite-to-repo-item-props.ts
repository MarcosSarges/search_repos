import type { Favorite } from '@/domain';
import type { RepoItemProps } from '@ds/organisms';

/** Maps domain `Favorite` → DS `RepoItem` primitives (no press / a11y / forks). */
export function mapFavoriteToRepoItemProps(
  favorite: Favorite,
): Pick<
  RepoItemProps,
  'name' | 'description' | 'languages' | 'ownerName' | 'ownerAvatarUrl' | 'stars'
> {
  return {
    name: favorite.name,
    description: favorite.description,
    languages: favorite.language ? [{ label: favorite.language }] : undefined,
    ownerName: favorite.ownerName,
    ownerAvatarUrl: favorite.ownerAvatarUrl,
    stars: favorite.stars,
  };
}
