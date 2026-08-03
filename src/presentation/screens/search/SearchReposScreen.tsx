import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { Repo } from '@/domain';
import { SessionSourceHeader } from '@/presentation/components';
import { mapAppErrorToMessage } from '@/presentation/errors/map-app-error-to-message';
import { useDebouncedValue } from '@/presentation/hooks/use-debounced-value';
import { useSearchRepos } from '@/presentation/hooks/use-search-repos';
import type { SearchStackParamList } from '@/presentation/navigation/types';
import { Button, Loading, Spacer, Typography } from '@ds/atoms';
import { Container, FlatList, InputField } from '@ds/molecules';

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
    isFetchNextPageError,
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

  const showingList = !isIdle && !isLoading && !isError && items.length > 0;

  let listBody: ReactNode;
  if (isIdle) {
    listBody = (
      <Typography variant="body" color="muted" testID="search-repos-idle">
        Digite para buscar repositórios.
      </Typography>
    );
  } else if (isLoading) {
    listBody = <Loading testID="search-repos-loading" />;
  } else if (isError) {
    listBody = (
      <>
        <Typography variant="body" color="danger" testID="search-repos-error">
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
      <Typography variant="body" color="muted" testID="search-repos-empty">
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
        extraData={items.length}
        loadingMore={isFetchingNextPage}
        footerError={isFetchNextPageError ? mapAppErrorToMessage(error) : undefined}
        refreshing={isRefetching && !isFetchingNextPage}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <Container bg="background" gap="md" flex={1}>
      <SessionSourceHeader safe title="Search" />
      <Container px="md" gap="sm">
        <InputField
          label="Buscar"
          placeholder="Buscar repositórios"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Buscar repositórios"
          testID="search-repos-input"
        />
      </Container>
      <Spacer top size="xs" />
      <Container
        testID="search-repos-list-region"
        flex={1}
        gap="sm"
        px={showingList ? undefined : 'md'}>
        {listBody}
      </Container>
    </Container>
  );
}
