import {
  FlatList as RNFlatList,
  RefreshControl,
  type FlatListProps as RNFlatListProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from 'styled-components/native';

import { Loading, Spacer, Typography } from '@ds/atoms';
import type { Spacing } from '@ds/tokens';

import { resolveBoxSpacing } from '../Container/resolveBoxSpacing';
import { FooterRoot } from './styles';

type FlatListSpacingProps = {
  p?: Spacing;
  px?: Spacing;
  py?: Spacing;
  pt?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
  pr?: Spacing;
};

export type FlatListProps<ItemT> = FlatListSpacingProps &
  Omit<RNFlatListProps<ItemT>, 'ItemSeparatorComponent'> & {
    separator?: boolean;
    separatorSize?: Spacing;
    ItemSeparatorComponent?: RNFlatListProps<ItemT>['ItemSeparatorComponent'];
    /** Shows the standard next-page Loading in the list footer. */
    loadingMore?: boolean;
    /** Shows a standard muted error message in the list footer (after loadingMore). */
    footerError?: string;
    /** Builds RefreshControl when `onRefresh` is also provided (unless `refreshControl` is passed). */
    refreshing?: boolean;
  };

function hasHorizontalPaddingProp(props: FlatListSpacingProps): boolean {
  return (
    props.p !== undefined ||
    props.px !== undefined ||
    props.pl !== undefined ||
    props.pr !== undefined
  );
}

function DefaultSeparator({ size }: { size: Spacing }) {
  return <Spacer top size={size} />;
}

function DefaultFooter({
  loadingMore,
  footerError,
}: {
  loadingMore?: boolean;
  footerError?: string;
}) {
  if (loadingMore) {
    return (
      <FooterRoot>
        <Loading testID="ds-flat-list-footer-loading" />
      </FooterRoot>
    );
  }
  if (footerError) {
    return (
      <FooterRoot>
        <Typography variant="body" color="muted" testID="ds-flat-list-footer-error">
          {footerError}
        </Typography>
      </FooterRoot>
    );
  }
  return null;
}

export function FlatList<ItemT>({
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  separator = true,
  separatorSize = 'lg',
  ItemSeparatorComponent,
  contentContainerStyle,
  style,
  testID = 'ds-flat-list',
  initialNumToRender = 20,
  onEndReachedThreshold = 0.5,
  windowSize = 10,
  maxToRenderPerBatch = 10,
  updateCellsBatchingPeriod = 50,
  loadingMore = false,
  footerError,
  refreshing = false,
  onRefresh,
  ListFooterComponent,
  refreshControl,
  ...rest
}: FlatListProps<ItemT>) {
  const theme = useTheme();

  const spacingInput: FlatListSpacingProps = hasHorizontalPaddingProp({ p, px, pl, pr })
    ? { p, px, py, pt, pb, pl, pr }
    : { p, px: px ?? 'md', py, pt, pb, pl, pr };

  const box = resolveBoxSpacing(theme.spacing, spacingInput);
  const paddingStyle: ViewStyle = {
    paddingTop: box.paddingTop,
    paddingRight: box.paddingRight,
    paddingBottom: box.paddingBottom,
    paddingLeft: box.paddingLeft,
  };

  const resolvedSeparator =
    ItemSeparatorComponent !== undefined
      ? ItemSeparatorComponent
      : separator === false
        ? undefined
        : () => <DefaultSeparator size={separatorSize} />;

  const resolvedFooter =
    ListFooterComponent !== undefined
      ? ListFooterComponent
      : () => <DefaultFooter loadingMore={loadingMore} footerError={footerError} />;

  const resolvedRefreshControl =
    refreshControl !== undefined ? (
      refreshControl
    ) : onRefresh ? (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={theme.colors.primary}
        colors={[theme.colors.primary]}
      />
    ) : undefined;

  const rootStyle: StyleProp<ViewStyle> = [{ flex: 1 }, style];

  return (
    <RNFlatList
      {...rest}
      testID={testID}
      style={rootStyle}
      contentContainerStyle={[paddingStyle, contentContainerStyle]}
      ItemSeparatorComponent={resolvedSeparator}
      ListFooterComponent={resolvedFooter}
      refreshControl={resolvedRefreshControl}
      initialNumToRender={initialNumToRender}
      onEndReachedThreshold={onEndReachedThreshold}
      windowSize={windowSize}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
    />
  );
}
