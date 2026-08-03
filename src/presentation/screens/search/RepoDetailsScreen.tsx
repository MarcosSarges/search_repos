import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';

import { createFavoriteFromRepo } from '@/application';
import { Avatar, Button, Icon, Loading, Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import { Hyperlink } from '@ds/organisms';
import { StackBackHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useFavorites } from '@/presentation/hooks/use-favorites';
import { useRepoDetails } from '@/presentation/hooks/use-repo-details';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { useAppTheme } from '@/presentation/theme';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoDetails'>;

export function RepoDetailsScreen({ route, navigation }: Props) {
  const { repoId } = route.params;
  const { dataSource } = useAppTheme();
  const { data, error, isError, isLoading, refetch } = useRepoDetails({ repoId });
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(dataSource, repoId);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleIssues = useCallback(() => {
    navigation.navigate('RepoIssues', { repoId });
  }, [navigation, repoId]);

  const handleToggleFavorite = useCallback(() => {
    if (!data) {
      return;
    }
    void toggleFavorite(createFavoriteFromRepo(data, dataSource));
  }, [data, dataSource, toggleFavorite]);

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

  const favoriteTrailing = data ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={favorited ? 'Remover dos favoritos' : 'Favoritar'}
      testID="repo-details-favorite"
      onPress={handleToggleFavorite}>
      <Icon name={favorited ? 'star' : 'star-outline'} size="lg" />
    </Pressable>
  ) : undefined;

  return (
    <Container bg="background" flex={1} gap="sm">
      <StackBackHeader safe title="Detalhes" trailing={favoriteTrailing} />
      {body}
    </Container>
  );
}
