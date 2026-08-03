import type { Repo } from '@/domain';
import type { RepoItemProps } from '@ds/organisms';

/** Maps domain `Repo` → DS `RepoItem` primitives (no press / a11y). */
export function mapRepoToRepoItemProps(
  repo: Repo,
): Pick<
  RepoItemProps,
  'name' | 'description' | 'languages' | 'ownerName' | 'ownerAvatarUrl' | 'stars' | 'forks'
> {
  return {
    name: repo.name,
    description: repo.description,
    languages: repo.language ? [{ label: repo.language }] : undefined,
    ownerName: repo.ownerName,
    ownerAvatarUrl: repo.ownerAvatarUrl,
    stars: repo.stars,
    forks: repo.forks,
  };
}
