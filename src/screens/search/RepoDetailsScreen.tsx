import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, Typography } from '@/components/ds/atoms';
import { Container } from '@/components/ds/molecules';
import type { SearchStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoDetails'>;

export function RepoDetailsScreen({ route, navigation }: Props) {
  const { repoId } = route.params;

  return (
    <Container tone="background">
      <Typography variant="body" testID="repo-details-repo-id">
        {repoId}
      </Typography>
      <Button
        accessibilityRole="button"
        accessibilityLabel="Ver issues"
        testID="repo-details-issues-cta"
        onPress={() => navigation.navigate('RepoIssues', { repoId })}>
        Ver issues
      </Button>
    </Container>
  );
}
