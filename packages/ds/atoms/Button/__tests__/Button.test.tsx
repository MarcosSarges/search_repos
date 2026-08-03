import { Text, View } from 'react-native';

import { getTheme } from '@ds/theme';
import { button, loading } from '@ds/tokens';
import { cleanup, fireEvent, render, screen } from '@/test';

import { Button, type ButtonProps } from '../Button';

describe('Button atom (PROP-09..16, PROP-20)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN variant is contained THEN filled chrome uses theme.colors for the color prop', async () => {
    await render(
      <Button variant="contained" color="primary" testID="btn">
        Save
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    expect(screen.getByTestId('btn')).toHaveStyleRule('background-color', theme.colors.primary);
  });

  it('WHEN variant is outlined THEN chrome uses color border without fill', async () => {
    await render(
      <Button variant="outlined" color="primary" testID="btn">
        Outline
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    const node = screen.getByTestId('btn');
    expect(node).toHaveStyleRule('border-color', theme.colors.primary);
    expect(node).toHaveStyleRule('background-color', 'transparent');
  });

  it('WHEN variant is text THEN chrome is transparent with no border', async () => {
    await render(
      <Button variant="text" color="primary" testID="btn">
        Ghost
      </Button>,
      { themeMode: 'light' },
    );

    const node = screen.getByTestId('btn');
    expect(node).toHaveStyleRule('background-color', 'transparent');
    expect(node).toHaveStyleRule('border-color', 'transparent');
  });

  it('WHEN color is danger with contained THEN fill uses theme.colors.danger', async () => {
    await render(
      <Button variant="contained" color="danger" testID="btn">
        Delete
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('btn')).toHaveStyleRule('background-color', theme.colors.danger);
  });

  it('WHEN variant and color are omitted THEN defaults are contained + primary', async () => {
    await render(<Button testID="btn">Default</Button>, { themeMode: 'light' });

    const theme = getTheme('light', 'github');
    expect(screen.getByTestId('btn')).toHaveStyleRule('background-color', theme.colors.primary);
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

  it('WHEN width is full THEN pressable stretches full width', async () => {
    await render(
      <Button width="full" testID="btn-full">
        Full
      </Button>,
    );

    const node = screen.getByTestId('btn-full');
    expect(node).toHaveStyleRule('align-self', 'stretch');
    expect(node).toHaveStyleRule('width', '100%');
  });

  it('WHEN width is omitted THEN pressable stretches full width (default full)', async () => {
    await render(<Button testID="btn-default-width">Default width</Button>);

    const node = screen.getByTestId('btn-default-width');
    expect(node).toHaveStyleRule('align-self', 'stretch');
    expect(node).toHaveStyleRule('width', '100%');
  });

  it('WHEN width is hug THEN pressable sizes to content', async () => {
    await render(
      <Button width="hug" testID="btn-hug">
        Hug
      </Button>,
    );

    expect(screen.getByTestId('btn-hug')).toHaveStyleRule('align-self', 'flex-start');
  });

  it('WHEN color is success with outlined THEN border uses theme.colors.success', async () => {
    await render(
      <Button variant="outlined" color="success" testID="btn-success">
        Ok
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    const node = screen.getByTestId('btn-success');
    expect(node).toHaveStyleRule('border-color', theme.colors.success);
    expect(node).toHaveStyleRule('background-color', 'transparent');
  });

  it('WHEN color is warning with text THEN label chrome uses theme.colors.warning border transparent', async () => {
    await render(
      <Button variant="text" color="warning" testID="btn-warning">
        Warn
      </Button>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light', 'github');
    const node = screen.getByTestId('btn-warning');
    expect(node).toHaveStyleRule('border-color', 'transparent');
    expect(node).toHaveStyleRule('background-color', 'transparent');
    expect(screen.getByText('Warn')).toHaveStyleRule('color', theme.colors.warning);
  });

  it('WHEN loading is true THEN Loading uses size from button token loadingSize', async () => {
    await render(
      <Button loading size="lg">
        Saving
      </Button>,
    );

    expect(screen.getByTestId('ds-loading').props.size).toBe(
      loading[button.lg.loadingSize].indicatorSize,
    );
  });

  it('WHEN public API is inspected THEN legacy variants primary outline ghost are absent', () => {
    type HasLegacyPrimary = 'primary' extends NonNullable<ButtonProps['variant']> ? true : false;
    type HasLegacyOutline = 'outline' extends NonNullable<ButtonProps['variant']> ? true : false;
    type HasLegacyGhost = 'ghost' extends NonNullable<ButtonProps['variant']> ? true : false;
    const hasLegacyPrimary: HasLegacyPrimary = false;
    const hasLegacyOutline: HasLegacyOutline = false;
    const hasLegacyGhost: HasLegacyGhost = false;
    expect(hasLegacyPrimary).toBe(false);
    expect(hasLegacyOutline).toBe(false);
    expect(hasLegacyGhost).toBe(false);
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

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof ButtonProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(
      <Button testID="btn" style={{ opacity: 0.7 }}>
        Styled
      </Button>,
    );
    expect(screen.getByTestId('btn')).toHaveStyle({ opacity: 0.7 });
  });
});
