import { FlatList, RefreshControl } from 'react-native';

import { Loading, Spacer, Typography } from '@ds/atoms';
import { Container, Header } from '@ds/molecules';
import type { Repo } from '@/domain';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useListTrendingRepos } from '@/presentation/hooks/use-list-trending-repos';

function flattenRepos(pages: { items: Repo[] }[] | undefined): Repo[] {
  return pages?.flatMap((page) => page.items) ?? [];
}

function repoMetaLine(repo: Repo): string {
  const parts = [`${repo.stars} stars`];
  if (repo.language) {
    parts.push(repo.language);
  }
  return parts.join(' · ');
}

function TrendingRow({ item }: { item: Repo }) {
  return (
    <>
      <Typography variant="body" testID={`explore-row-${item.id}`}>
        {item.fullName}
      </Typography>
      <Typography variant="caption" color="muted">
        {repoMetaLine(item)}
      </Typography>
      <Spacer bottom size="md" />
    </>
  );
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

  return (
    <Container bg="background" flex={1} testID="explore-screen">
      <Header safe title="Explore" />
      {showInitialLoading ? (
        <Loading testID="explore-initial-loading" />
      ) : isError && items.length === 0 ? (
        <Typography variant="body" color="muted" testID="explore-error">
          {mapAppErrorToMessage(error)}
        </Typography>
      ) : showEmpty ? (
        <Typography variant="body" color="muted" testID="explore-empty">
          Nenhum repositório trending encontrado.
        </Typography>
      ) : (
        <FlatList
          testID="explore-list"
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TrendingRow item={item} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              void fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
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
      )}
    </Container>
  );
}
