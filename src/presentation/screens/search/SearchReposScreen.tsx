import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import { Button, Loading, Typography } from '@ds/atoms';
import { Container, Header, InputField } from '@ds/molecules';
import type { Repo } from '@/domain';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useDebouncedValue } from '@/presentation/hooks/use-debounced-value';
import { useSearchRepos } from '@/presentation/hooks/use-search-repos';
import type { SearchStackParamList } from '@/presentation/navigation/types';

import { RepoListItem } from './RepoListItem';

type Props = NativeStackScreenProps<SearchStackParamList, 'SearchRepos'>;

export function SearchReposScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);
  const isIdle = debouncedQuery.trim().length === 0;

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
  } = useSearchRepos({ query: debouncedQuery });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handlePress = useCallback(
    (repoId: string) => {
      navigation.navigate('RepoDetails', { repoId });
    },
    [navigation],
  );

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  let listBody: ReactNode;
  if (isIdle) {
    listBody = (
      <Typography variant="body" tone="muted" testID="search-repos-idle">
        Digite para buscar repositórios.
      </Typography>
    );
  } else if (isLoading) {
    listBody = <Loading testID="search-repos-loading" />;
  } else if (isError) {
    listBody = (
      <>
        <Typography variant="body" tone="danger" testID="search-repos-error">
          {mapAppErrorToMessage(error)}
        </Typography>
        <Button
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          testID="search-repos-retry"
          onPress={handleRetry}>
          Tentar novamente
        </Button>
      </>
    );
  } else if (items.length === 0) {
    listBody = (
      <Typography variant="body" tone="muted" testID="search-repos-empty">
        Nenhum repositório encontrado.
      </Typography>
    );
  } else {
    listBody = (
      <FlatList
        testID="search-repos-list"
        data={items}
        keyExtractor={(item: Repo) => item.id}
        renderItem={({ item }) => <RepoListItem repo={item} onPress={handlePress} />}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
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

  return (
    <Container tone="background">
      <Header safe title="Search" />
      <InputField
        label="Buscar"
        placeholder="Buscar repositórios"
        value={query}
        onChangeText={setQuery}
        accessibilityLabel="Buscar repositórios"
        testID="search-repos-input"
      />
      <View testID="search-repos-list-region">{listBody}</View>
    </Container>
  );
}
