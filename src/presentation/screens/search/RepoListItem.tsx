import { Pressable } from 'react-native';

import { Typography } from '@ds/atoms';
import { Card } from '@ds/molecules';
import type { Repo } from '@/domain';

export type RepoListItemProps = {
  repo: Repo;
  onPress: (repoId: string) => void;
};

export function RepoListItem({ repo, onPress }: RepoListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={repo.fullName}
      testID="repo-list-item"
      onPress={() => onPress(repo.id)}>
      <Card>
        <Card.Header>
          <Typography variant="heading">{repo.name}</Typography>
          <Typography variant="caption" tone="muted">
            {repo.ownerName}
          </Typography>
        </Card.Header>
        <Card.Content>
          {repo.description ? (
            <Typography variant="body" tone="muted">
              {repo.description}
            </Typography>
          ) : null}
          <Typography variant="caption">{String(repo.stars)}</Typography>
          {repo.language ? <Typography variant="caption">{repo.language}</Typography> : null}
        </Card.Content>
      </Card>
    </Pressable>
  );
}
