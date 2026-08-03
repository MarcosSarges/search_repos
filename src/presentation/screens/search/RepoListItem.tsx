import { Pressable } from 'react-native';

import type { Repo } from '@/domain';
import { mapRepoToRepoItemProps } from '@/presentation/mappers/map-repo-to-repo-item-props';
import { RepoItem } from '@ds/organisms';

export type RepoListItemProps = {
  repo: Repo;
  /** When omitted, the row is presentational only (e.g. Explore). */
  onPress?: (repoId: string) => void;
  testID?: string;
};

/**
 * Presentation adapter: maps domain `Repo` → DS `RepoItem`.
 * Optional `onPress` wraps Pressable; without it the card is not interactive.
 */
export function RepoListItem({ repo, onPress, testID = 'repo-list-item' }: RepoListItemProps) {
  const item = <RepoItem {...mapRepoToRepoItemProps(repo)} />;

  if (!onPress) {
    return item;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={repo.fullName}
      testID={testID}
      onPress={() => onPress(repo.id)}>
      {item}
    </Pressable>
  );
}
