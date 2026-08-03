import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, type ReactNode } from 'react';
import { FlatList, RefreshControl } from 'react-native';

import type { Issue } from '@/domain';
import { StackBackHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useRepoDetails } from '@/presentation/hooks/use-repo-details';
import { useRepoIssues } from '@/presentation/hooks/use-repo-issues';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { Button, Loading, Spacer, Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import { Hyperlink } from '@ds/organisms';

import { IssueListItem } from './IssueListItem';

type Props = NativeStackScreenProps<SearchStackParamList, 'RepoIssues'>;

export function RepoIssuesScreen({ route }: Props) {
  const { repoId } = route.params;
  const details = useRepoDetails({ repoId });
  const {
    data,
    error,
    isError,
    isLoading,
    isFetchingNextPage,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useRepoIssues({ repoId });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  let listBody: ReactNode;
  if (isLoading) {
    listBody = <Loading testID="repo-issues-loading" />;
  } else if (isError) {
    listBody = (
      <Container gap="sm">
        <Typography variant="body" color="danger" testID="repo-issues-error">
          {mapAppErrorToMessage(error)}
        </Typography>
        <Button
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          testID="repo-issues-retry"
          onPress={handleRetry}>
          Tentar novamente
        </Button>
      </Container>
    );
  } else if (items.length === 0) {
    listBody = (
      <Typography variant="body" color="muted" testID="repo-issues-empty">
        Nenhuma issue encontrada.
      </Typography>
    );
  } else {
    listBody = (
      <FlatList
        testID="repo-issues-list"
        data={items}
        keyExtractor={(item: Issue) => item.id}
        renderItem={({ item }) => <IssueListItem issue={item} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        ItemSeparatorComponent={() => <Spacer top size="lg" />}
        extraData={items.length}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={handleRefresh}
          />
        }
      />
    );
  }

  const repo = details.data;

  return (
    <Container bg="background" flex={1} gap="sm">
      <StackBackHeader safe title="Issues" />
      <Container px="md" gap="sm" flex={1}>
        {repo ? (
          <Hyperlink href={repo.htmlUrl} testID="repo-issues-repo-link">
            {repo.fullName}
          </Hyperlink>
        ) : null}
        {listBody}
      </Container>
    </Container>
  );
}
