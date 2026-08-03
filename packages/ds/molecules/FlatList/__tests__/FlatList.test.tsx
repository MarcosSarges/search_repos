import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { StyleSheet, Text, View } from 'react-native';

import { render, screen } from '@/test';
import { spacing } from '@ds/tokens';

import { FlatList } from '../FlatList';

const DATA = [
  { id: '1', label: 'A' },
  { id: '2', label: 'B' },
];

function renderRow({ item }: { item: (typeof DATA)[number] }) {
  return <Text>{item.label}</Text>;
}

describe('FlatList molecule (RITEM-11)', () => {
  it('WHEN spacing props are set THEN padding is on contentContainerStyle only, not root style', async () => {
    await render(
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        px="lg"
        pt="sm"
      />,
    );

    const list = screen.getByTestId('ds-flat-list');
    const root = StyleSheet.flatten(list.props.style) ?? {};
    const content = StyleSheet.flatten(list.props.contentContainerStyle) ?? {};

    expect(root.padding).toBeUndefined();
    expect(root.paddingTop).toBeUndefined();
    expect(root.paddingRight).toBeUndefined();
    expect(root.paddingBottom).toBeUndefined();
    expect(root.paddingLeft).toBeUndefined();
    expect(root.paddingHorizontal).toBeUndefined();
    expect(root.paddingVertical).toBeUndefined();

    expect(content.paddingLeft).toBe(spacing.lg);
    expect(content.paddingRight).toBe(spacing.lg);
    expect(content.paddingTop).toBe(spacing.sm);
  });

  it('WHEN spacing props are omitted THEN content defaults to px="md"', async () => {
    await render(<FlatList data={DATA} keyExtractor={(item) => item.id} renderItem={renderRow} />);

    const list = screen.getByTestId('ds-flat-list');
    const content = StyleSheet.flatten(list.props.contentContainerStyle) ?? {};

    expect(content.paddingLeft).toBe(spacing.md);
    expect(content.paddingRight).toBe(spacing.md);
  });

  it('WHEN ItemSeparatorComponent is omitted and separator is not false THEN default is Spacer top lg', async () => {
    await render(<FlatList data={DATA} keyExtractor={(item) => item.id} renderItem={renderRow} />);

    const list = screen.getByTestId('ds-flat-list');
    const Separator = list.props.ItemSeparatorComponent;
    expect(Separator).toBeDefined();

    await render(<Separator />);
    const spacer = screen.getByTestId('ds-spacer');
    expect(spacer).toHaveStyle({ height: spacing.lg });
  });

  it('WHEN separator={false} THEN no default ItemSeparatorComponent is injected', async () => {
    await render(
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        separator={false}
      />,
    );

    const list = screen.getByTestId('ds-flat-list');
    expect(list.props.ItemSeparatorComponent).toBeUndefined();
  });

  it('WHEN ItemSeparatorComponent is provided THEN it overrides the default Spacer', async () => {
    function CustomSeparator() {
      return <View testID="custom-separator" />;
    }

    await render(
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        ItemSeparatorComponent={CustomSeparator}
      />,
    );

    const list = screen.getByTestId('ds-flat-list');
    expect(list.props.ItemSeparatorComponent).toBe(CustomSeparator);
  });

  it('WHEN performance props are omitted THEN molecule defaults apply', async () => {
    await render(<FlatList data={DATA} keyExtractor={(item) => item.id} renderItem={renderRow} />);

    const list = screen.getByTestId('ds-flat-list');
    expect(list.props.initialNumToRender).toBe(20);
    expect(list.props.onEndReachedThreshold).toBe(0.5);
    expect(list.props.windowSize).toBe(10);
    expect(list.props.maxToRenderPerBatch).toBe(10);
    expect(list.props.updateCellsBatchingPeriod).toBe(50);
  });

  it('WHEN consumer overrides performance props THEN consumer values win', async () => {
    await render(
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        initialNumToRender={5}
        onEndReachedThreshold={0.2}
        windowSize={3}
        maxToRenderPerBatch={2}
        updateCellsBatchingPeriod={100}
      />,
    );

    const list = screen.getByTestId('ds-flat-list');
    expect(list.props.initialNumToRender).toBe(5);
    expect(list.props.onEndReachedThreshold).toBe(0.2);
    expect(list.props.windowSize).toBe(3);
    expect(list.props.maxToRenderPerBatch).toBe(2);
    expect(list.props.updateCellsBatchingPeriod).toBe(100);
  });

  it('WHEN consumer contentContainerStyle is passed THEN it merges after molecule padding', async () => {
    await render(
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        px="md"
        contentContainerStyle={{ paddingHorizontal: 0 }}
      />,
    );

    const list = screen.getByTestId('ds-flat-list');
    const content = StyleSheet.flatten(list.props.contentContainerStyle) ?? {};

    expect(content.paddingHorizontal).toBe(0);
  });

  it('WHEN folder is inspected THEN AD-012 molecule files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'FlatList.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'FlatList.stories.tsx'))).toBe(true);
  });
});
