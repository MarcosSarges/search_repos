import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';

import type { Repo } from '@/domain';
import { SessionSourceHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useListTrendingRepos } from '@/presentation/hooks/use-list-trending-repos';
import type { TabsParamList } from '@/presentation/navigation/types';
import { Loading, Typography } from '@ds/atoms';
import { Container, FlatList } from '@ds/molecules';

import { RepoListItem } from './search/RepoListItem';

function flattenRepos(pages: { items: Repo[] }[] | undefined): Repo[] {
  return pages?.flatMap((page) => page.items) ?? [];
}

export function ExploreScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList, 'Explore'>>();
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

  const handlePress = useCallback(
    (repoId: string) => {
      navigation.navigate('Search', {
        screen: 'RepoDetails',
        params: { repoId },
      });
    },
    [navigation],
  );

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
        renderItem={({ item }) => <RepoListItem repo={item} onPress={handlePress} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
          }
        }}
        loadingMore={isFetchingNextPage}
        footerError={isFetchNextPageError ? mapAppErrorToMessage(error) : undefined}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <Container bg="background" flex={1} testID="explore-screen">
      <SessionSourceHeader safe title="Explore" />
      <Container flex={1} px={showingList ? undefined : 'md'} pt="md">
        {body}
      </Container>
    </Container>
  );
}
