import { Text, View } from 'react-native';

import { getTheme } from '@ds/theme';
import { button } from '@ds/tokens';
import { cleanup, fireEvent, render, screen } from '@/test';

import { Button, type ButtonProps } from '../Button';

describe('Button atom (CTRL-01)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN variant is primary THEN filled chrome uses theme.colors.primary', async () => {
    await render(
      <Button variant="primary" testID="btn">
        Save
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    expect(screen.getByTestId('btn')).toHaveStyleRule('background-color', theme.colors.primary);
  });

  it('WHEN variant is outline THEN chrome uses primary border without primary fill', async () => {
    await render(
      <Button variant="outline" testID="btn">
        Outline
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    const node = screen.getByTestId('btn');
    expect(node).toHaveStyleRule('border-color', theme.colors.primary);
    expect(node).toHaveStyleRule('background-color', 'transparent');
  });

  it('WHEN variant is ghost THEN chrome is transparent with no border fill', async () => {
    await render(
      <Button variant="ghost" testID="btn">
        Ghost
      </Button>,
      { themeMode: 'light' },
    );

    const node = screen.getByTestId('btn');
    expect(node).toHaveStyleRule('background-color', 'transparent');
    expect(node).toHaveStyleRule('border-color', 'transparent');
  });

  it('WHEN size is sm THEN padding and minHeight come from button size tokens', async () => {
    await render(
      <Button size="sm" testID="btn-sm">
        Sized
      </Button>,
    );

    const token = button.sm;
    const node = screen.getByTestId('btn-sm');
    expect(node).toHaveStyleRule('min-height', token.minHeight);
    expect(node).toHaveStyleRule('padding-top', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-bottom', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-left', token.paddingHorizontal);
    expect(node).toHaveStyleRule('padding-right', token.paddingHorizontal);
  });

  it('WHEN size is md THEN padding and minHeight come from button size tokens', async () => {
    await render(
      <Button size="md" testID="btn-md">
        Sized
      </Button>,
    );

    const token = button.md;
    const node = screen.getByTestId('btn-md');
    expect(node).toHaveStyleRule('min-height', token.minHeight);
    expect(node).toHaveStyleRule('padding-top', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-bottom', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-left', token.paddingHorizontal);
    expect(node).toHaveStyleRule('padding-right', token.paddingHorizontal);
  });

  it('WHEN size is lg THEN padding and minHeight come from button size tokens', async () => {
    await render(
      <Button size="lg" testID="btn-lg">
        Sized
      </Button>,
    );

    const token = button.lg;
    const node = screen.getByTestId('btn-lg');
    expect(node).toHaveStyleRule('min-height', token.minHeight);
    expect(node).toHaveStyleRule('padding-top', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-bottom', token.paddingVertical);
    expect(node).toHaveStyleRule('padding-left', token.paddingHorizontal);
    expect(node).toHaveStyleRule('padding-right', token.paddingHorizontal);
  });

  it('WHEN disabled is true THEN onPress is not invoked and accessibilityState is disabled', async () => {
    const onPress = jest.fn();
    await render(
      <Button disabled onPress={onPress}>
        Disabled
      </Button>,
    );

    const node = screen.getByTestId('ds-button');
    fireEvent.press(node);
    expect(onPress).not.toHaveBeenCalled();
    expect(node.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('WHEN loading is true THEN Loading shows, onPress is blocked, and min size is kept', async () => {
    const onPress = jest.fn();
    await render(
      <Button loading size="md" onPress={onPress}>
        Saving
      </Button>,
    );

    expect(screen.getByTestId('ds-loading')).toBeTruthy();
    expect(screen.queryByText('Saving')).toBeNull();

    const node = screen.getByTestId('ds-button');
    fireEvent.press(node);
    expect(onPress).not.toHaveBeenCalled();
    expect(node).toHaveStyleRule('min-height', button.md.minHeight);
  });

  it('WHEN leading and trailing are passed and loading is false THEN they render in leading→label→trailing order', async () => {
    await render(
      <Button leading={<Text testID="leading">L</Text>} trailing={<Text testID="trailing">T</Text>}>
        Label
      </Button>,
    );

    expect(screen.getByTestId('leading')).toBeTruthy();
    expect(screen.getByTestId('trailing')).toBeTruthy();
    expect(screen.getByTestId('ds-button')).toHaveTextContent('LLabelT');
  });

  it('WHEN loading and disabled together THEN press is blocked', async () => {
    const onPress = jest.fn();
    await render(
      <Button loading disabled onPress={onPress}>
        Busy
      </Button>,
    );

    fireEvent.press(screen.getByTestId('ds-button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('WHEN loading with leading and trailing THEN slots and label are hidden', async () => {
    await render(
      <Button loading leading={<View testID="leading" />} trailing={<View testID="trailing" />}>
        Label
      </Button>,
    );

    expect(screen.getByTestId('ds-loading')).toBeTruthy();
    expect(screen.queryByTestId('leading')).toBeNull();
    expect(screen.queryByTestId('trailing')).toBeNull();
    expect(screen.queryByText('Label')).toBeNull();
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof ButtonProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
