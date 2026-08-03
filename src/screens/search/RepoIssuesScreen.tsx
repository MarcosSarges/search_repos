import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Typography } from '@/components/ds/atoms';
import { Container } from '@/components/ds/molecules';
import type { SearchStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoIssues'>;

export function RepoIssuesScreen({ route }: Props) {
  const { repoId } = route.params;

  return (
    <Container tone="background">
      <Typography variant="body" testID="repo-issues-repo-id">
        {repoId}
      </Typography>
    </Container>
  );
}
