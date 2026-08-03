import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { Avatar, Button, Icon, Loading, Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import { Hyperlink } from '@ds/organisms';
import { SessionSourceHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useRepoDetails } from '@/presentation/hooks/use-repo-details';
import type { SearchStackParamList } from '@/presentation/navigation/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoDetails'>;

export function RepoDetailsScreen({ route, navigation }: Props) {
  const { repoId } = route.params;
  const { data, error, isError, isLoading, refetch } = useRepoDetails({ repoId });

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

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

          <Container direction="row" gap="md" wrap="wrap" testID="repo-details-metrics">
            <Typography variant="caption">{String(data.stars)}</Typography>
            <Typography variant="caption">{String(data.forks)}</Typography>
            <Typography variant="caption">{String(data.watchers)}</Typography>
          </Container>

          {data.language ? (
            <Typography variant="caption" color="muted">
              {data.language}
            </Typography>
          ) : null}

          {data.description ? (
            <Typography variant="body" color="muted" testID="repo-details-description">
              {data.description}
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
      <SessionSourceHeader
        safe
        title="Detalhes"
        leading={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={handleBack}
            testID="repo-details-back">
            <Icon name="arrow-back" size="lg" />
          </Pressable>
        }
      />
      {body}
    </Container>
  );
}
