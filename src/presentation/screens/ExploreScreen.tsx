import { RefreshControl } from 'react-native';

import { Loading, Typography } from '@ds/atoms';
import { Container, FlatList, Header } from '@ds/molecules';
import type { Repo } from '@/domain';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useListTrendingRepos } from '@/presentation/hooks/use-list-trending-repos';

import { RepoListItem } from './search/RepoListItem';

function flattenRepos(pages: { items: Repo[] }[] | undefined): Repo[] {
  return pages?.flatMap((page) => page.items) ?? [];
}

export function ExploreScreen() {
  const {
    data,
    error,
    isPending,
    isError,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefetching,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useListTrendingRepos();

  const items = flattenRepos(data?.pages);
  const showInitialLoading = isPending && items.length === 0;
  const showEmpty = !isPending && !isError && items.length === 0;
  const showingList = !showInitialLoading && !(isError && items.length === 0) && !showEmpty;

  let body = null;
  if (showInitialLoading) {
    body = <Loading testID="explore-initial-loading" />;
  } else if (isError && items.length === 0) {
    body = (
      <Typography variant="body" color="muted" testID="explore-error">
        {mapAppErrorToMessage(error)}
      </Typography>
    );
  } else if (showEmpty) {
    body = (
      <Typography variant="body" color="muted" testID="explore-empty">
        Nenhum repositório trending encontrado.
      </Typography>
    );
  } else {
    body = (
      <FlatList
        testID="explore-list"
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RepoListItem repo={item} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <Loading testID="explore-footer-loading" />
          ) : isFetchNextPageError ? (
            <Typography variant="body" color="muted" testID="explore-next-page-error">
              {mapAppErrorToMessage(error)}
            </Typography>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => {
              void refetch();
            }}
          />
        }
      />
    );
  }

  return (
    <Container bg="background" flex={1} testID="explore-screen">
      <Header safe title="Explore" />
      <Container flex={1} px={showingList ? undefined : 'md'}>
        {body}
      </Container>
    </Container>
  );
}
