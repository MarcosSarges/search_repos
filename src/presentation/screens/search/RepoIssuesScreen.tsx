import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import type { SearchStackParamList } from '@/presentation/navigation/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoIssues'>;

export function RepoIssuesScreen({ route }: Props) {
  const { repoId } = route.params;

  return (
    <Container bg="background">
      <Typography variant="body" testID="repo-issues-repo-id">
        {repoId}
      </Typography>
    </Container>
  );
}
