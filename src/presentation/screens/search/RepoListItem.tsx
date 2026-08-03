import { Pressable } from 'react-native';

import type { Repo } from '@/domain';
import { RepoItem } from '@ds/organisms';

export type RepoListItemProps = {
  repo: Repo;
  onPress: (repoId: string) => void;
};

/**
 * Presentation adapter: maps domain `Repo` → DS `RepoItem` and owns press.
 */
export function RepoListItem({ repo, onPress }: RepoListItemProps) {
  const languages = repo.language ? [{ label: repo.language }] : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={repo.fullName}
      testID="repo-list-item"
      onPress={() => onPress(repo.id)}>
      <RepoItem
        name={repo.name}
        description={repo.description}
        languages={languages}
        ownerName={repo.ownerName}
        ownerAvatarUrl={repo.ownerAvatarUrl}
        stars={repo.stars}
        forks={repo.forks}
      />
    </Pressable>
  );
}
