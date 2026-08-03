import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

import type { DataSource } from '@/application';
import type { Favorite } from '@/domain';
import { SessionSourceHeader } from '@/presentation/components';
import { useFavorites } from '@/presentation/hooks/use-favorites';
import { mapFavoriteToRepoItemProps } from '@/presentation/mappers/map-favorite-to-repo-item-props';
import type { TabsParamList } from '@/presentation/navigation/types';
import { useAppTheme } from '@/presentation/theme';
import { Button, Loading, Typography } from '@ds/atoms';
import { Container } from '@ds/molecules';
import { DataSourceLogo, RepoItem } from '@ds/organisms';

const SOURCE_SECTIONS: { source: DataSource; label: string }[] = [
  { source: 'github', label: 'GitHub' },
  { source: 'gitlab', label: 'GitLab' },
];

function sortByFavoritedAtDesc(a: Favorite, b: Favorite) {
  return b.favoritedAt - a.favoritedAt;
}

type FavoriteSwipeRowProps = {
  item: Favorite;
  onPress: (item: Favorite) => void;
  onRemove: (item: Favorite) => void;
};

function FavoriteSwipeRow({ item, onPress, onRemove }: FavoriteSwipeRowProps) {
  const renderRightActions = useCallback(
    () => (
      <Button
        accessibilityRole="button"
        accessibilityLabel="Remover"
        testID={`favoritos-remove-${item.source}-${item.id}`}
        color="danger"
        width="hug"
        onPress={() => onRemove(item)}>
        Remover
      </Button>
    ),
    [item, onRemove],
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={item.fullName}
        testID={`favoritos-row-${item.source}-${item.id}`}
        onPress={() => onPress(item)}>
        <RepoItem {...mapFavoriteToRepoItemProps(item)} />
      </Pressable>
    </Swipeable>
  );
}

export function FavoritosScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<TabsParamList, 'Favoritos'>>();
  const { dataSource, setDataSource } = useAppTheme();
  const { items, hasHydrated, removeFavorite } = useFavorites();

  const githubItems = items
    .filter((item) => item.source === 'github')
    .slice()
    .sort(sortByFavoritedAtDesc);
  const gitlabItems = items
    .filter((item) => item.source === 'gitlab')
    .slice()
    .sort(sortByFavoritedAtDesc);
  const bothEmpty = githubItems.length === 0 && gitlabItems.length === 0;

  const handlePress = useCallback(
    (item: Favorite) => {
      if (dataSource !== item.source && (item.source === 'github' || item.source === 'gitlab')) {
        setDataSource(item.source);
      }
      navigation.navigate('Search', {
        screen: 'RepoDetails',
        params: { repoId: item.id },
      });
    },
    [dataSource, navigation, setDataSource],
  );

  const handleRemove = useCallback(
    (item: Favorite) => {
      if (item.source === 'github' || item.source === 'gitlab') {
        void removeFavorite(item.source, item.id);
      }
    },
    [removeFavorite],
  );

  let body = null;
  if (!hasHydrated) {
    body = <Loading testID="favoritos-loading" />;
  } else if (bothEmpty) {
    body = (
      <Container gap="md" px="md" pt="md">
        <Typography variant="body" color="muted" testID="favoritos-empty">
          Você ainda não tem favoritos. Que tal explorar alguns repositórios?
        </Typography>
        <Button
          accessibilityRole="button"
          accessibilityLabel="Ir para Search"
          testID="favoritos-cta-search"
          onPress={() => {
            navigation.navigate('Search');
          }}>
          Search
        </Button>
        <Button
          accessibilityRole="button"
          accessibilityLabel="Ir para Explore"
          testID="favoritos-cta-explore"
          onPress={() => {
            navigation.navigate('Explore');
          }}>
          Explore
        </Button>
      </Container>
    );
  } else {
    body = (
      <ScrollView testID="favoritos-list">
        {SOURCE_SECTIONS.map(({ source, label }) => {
          const sectionItems = source === 'github' ? githubItems : gitlabItems;
          if (sectionItems.length === 0) {
            return null;
          }
          return (
            <Container key={source} gap="sm" px="md" pt="md" testID={`favoritos-section-${source}`}>
              <Container direction="row" align="center" gap="sm">
                <DataSourceLogo brand={source} size="md" />
                <Typography variant="heading">{label}</Typography>
              </Container>
              {sectionItems.map((item) => (
                <FavoriteSwipeRow
                  key={`${item.source}-${item.id}`}
                  item={item}
                  onPress={handlePress}
                  onRemove={handleRemove}
                />
              ))}
            </Container>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <Container bg="background" flex={1} testID="favoritos-screen">
      <SessionSourceHeader safe title="Favoritos" />
      {body}
    </Container>
  );
}
