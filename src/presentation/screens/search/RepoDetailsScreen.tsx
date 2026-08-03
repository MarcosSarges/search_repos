import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { ScrollView, View } from 'react-native';

import { Avatar, Button, Icon, Loading, Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import { Hyperlink } from '@ds/organisms';
import { StackBackHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useRepoDetails } from '@/presentation/hooks/use-repo-details';
import type { SearchStackParamList } from '@/presentation/navigation/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoDetails'>;

export function RepoDetailsScreen({ route, navigation }: Props) {
  const { repoId } = route.params;
  const { data, error, isError, isLoading, refetch } = useRepoDetails({ repoId });

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleIssues = useCallback(() => {
    navigation.navigate('RepoIssues', { repoId });
  }, [navigation, repoId]);

  let body = null;
  if (isLoading) {
    body = <Loading testID="repo-details-loading" />;
  } else if (isError) {
    body = (
      <Container gap="sm" px="md">
        <Typography variant="body" color="danger" testID="repo-details-error">
          {mapAppErrorToMessage(error)}
        </Typography>
        <Button
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          testID="repo-details-retry"
          onPress={handleRetry}>
          Tentar novamente
        </Button>
      </Container>
    );
  } else if (data) {
    const trimmedDescription = data.description?.trim();

    body = (
      <ScrollView testID="repo-details-content">
        <Container gap="md" px="md" pb="lg">
          <Container direction="row" align="center" gap="sm">
            <Avatar uri={data.ownerAvatarUrl} name={data.ownerName} size="lg" />
            <Typography variant="body">{data.ownerName}</Typography>
          </Container>

          <Typography variant="heading" testID="repo-details-full-name">
            {data.fullName}
          </Typography>

          <Container
            direction="row"
            gap="md"
            wrap="wrap"
            align="center"
            testID="repo-details-metrics">
            <View
              accessibilityRole="text"
              accessibilityLabel={`${data.stars} stars`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="star" size="sm" color="muted" />
              <Typography variant="caption">{String(data.stars)}</Typography>
            </View>
            <View
              accessibilityRole="text"
              accessibilityLabel={`${data.forks} forks`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="git-network" size="sm" color="muted" />
              <Typography variant="caption">{String(data.forks)}</Typography>
            </View>
            <View
              accessibilityRole="text"
              accessibilityLabel={`${data.watchers} watchers`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="eye-outline" size="sm" color="muted" />
              <Typography variant="caption">{String(data.watchers)}</Typography>
            </View>
          </Container>

          {data.language ? (
            <Typography variant="caption" color="muted">
              {data.language}
            </Typography>
          ) : null}

          {trimmedDescription ? (
            <Typography variant="body" color="muted" testID="repo-details-description">
              {trimmedDescription}
            </Typography>
          ) : null}

          <Hyperlink href={data.htmlUrl}>Abrir no site</Hyperlink>

          <Button
            accessibilityRole="button"
            accessibilityLabel="Ver issues"
            testID="repo-details-issues-cta"
            onPress={handleIssues}>
            Ver issues
          </Button>
        </Container>
      </ScrollView>
    );
  }

  return (
    <Container bg="background" flex={1} gap="sm">
      <StackBackHeader safe title="Detalhes" />
      {body}
    </Container>
  );
}
