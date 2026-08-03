import { Keyboard, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { fireEvent, render, screen } from '@/test';
import { getTheme } from '@ds/theme';
import { spacing } from '@ds/tokens';

import { Container, type ContainerProps } from '../Container';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 11, right: 13, bottom: 34 },
};

describe('Container molecule (PROP-04..05,20)', () => {
  it('WHEN p is md THEN it applies theme.spacing.md on all padding edges', async () => {
    await render(
      <Container p="md">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.md);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md);
    expect(node).toHaveStyleRule('padding-left', spacing.md);
    expect(node).toHaveStyleRule('padding-right', spacing.md);
  });

  it('WHEN p and pt THEN pt overrides top only', async () => {
    await render(
      <Container p="md" pt="xl">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.xl);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md);
    expect(node).toHaveStyleRule('padding-left', spacing.md);
    expect(node).toHaveStyleRule('padding-right', spacing.md);
  });

  it('WHEN flexbox props are set THEN they apply without a boolean flex flag', async () => {
    await render(
      <Container flex={1} direction="row" justify="between" align="center" wrap="wrap">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyle({ flexGrow: 1, flexShrink: 1, flexBasis: 0 });
    expect(node).toHaveStyleRule('flex-direction', 'row');
    expect(node).toHaveStyleRule('justify-content', 'space-between');
    expect(node).toHaveStyleRule('align-items', 'center');
    expect(node).toHaveStyleRule('flex-wrap', 'wrap');
  });

  it('WHEN bg is surface THEN background uses theme.colors.surface', async () => {
    await render(
      <Container bg="surface">
        <View />
      </Container>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('ds-container')).toHaveStyleRule(
      'background-color',
      theme.colors.surface,
    );
  });

  it('WHEN bg is background THEN background uses theme.colors.background', async () => {
    await render(
      <Container bg="background">
        <View />
      </Container>,
      { themeMode: 'dark' },
    );

    const theme = getTheme('dark');
    expect(screen.getByTestId('ds-container')).toHaveStyleRule(
      'background-color',
      theme.colors.background,
    );
  });

  it('WHEN bg is omitted THEN it does not apply theme fill background-color', async () => {
    await render(
      <Container>
        <View />
      </Container>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    const node = screen.getByTestId('ds-container');
    expect(node).not.toHaveStyleRule('background-color', theme.colors.background);
    expect(node).not.toHaveStyleRule('background-color', theme.colors.surface);
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof ContainerProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(
      <Container testID="box" style={{ opacity: 0.4 }}>
        <View />
      </Container>,
    );

    expect(screen.getByTestId('box')).toHaveStyle({ opacity: 0.4 });
  });

  it('WHEN public props are inspected THEN tone is not part of the API', () => {
    type HasTone = 'tone' extends keyof ContainerProps ? true : false;
    const hasTone: HasTone = false;
    expect(hasTone).toBe(false);
  });

  it('WHEN safe is omitted THEN it does not add safe-area padding', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Container p="md">
          <View />
        </Container>
      </SafeAreaProvider>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.md);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md);
  });

  it('WHEN safe is true THEN insets are additive to token padding on all edges', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Container p="md" safe>
          <View />
        </Container>
      </SafeAreaProvider>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.md + 47);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md + 34);
    expect(node).toHaveStyleRule('padding-left', spacing.md + 11);
    expect(node).toHaveStyleRule('padding-right', spacing.md + 13);
  });

  it('WHEN safe is an edge array THEN only listed edges get insets', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Container p="sm" safe={['bottom']}>
          <View />
        </Container>
      </SafeAreaProvider>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.sm);
    expect(node).toHaveStyleRule('padding-bottom', spacing.sm + 34);
    expect(node).toHaveStyleRule('padding-left', spacing.sm);
    expect(node).toHaveStyleRule('padding-right', spacing.sm);
  });

  it('WHEN keyboardDismiss is true THEN pressing dismisses the keyboard', async () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

    await render(
      <Container keyboardDismiss>
        <View testID="inside" />
      </Container>,
    );

    fireEvent.press(screen.getByTestId('inside'));
    expect(dismissSpy).toHaveBeenCalled();

    dismissSpy.mockRestore();
  });

  it('WHEN keyboardDismiss is omitted THEN press does not dismiss the keyboard', async () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

    await render(
      <Container>
        <View testID="inside" />
      </Container>,
    );

    fireEvent.press(screen.getByTestId('inside'));
    expect(dismissSpy).not.toHaveBeenCalled();

    dismissSpy.mockRestore();
  });

  it('WHEN safe is false THEN it does not add safe-area padding', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Container p="md" safe={false}>
          <View />
        </Container>
      </SafeAreaProvider>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.md);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md);
  });

  it('WHEN keyboardDismiss is true and TextInput is focused THEN Keyboard.dismiss is not called', async () => {
    const dismissSpy = jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});

    await render(
      <Container keyboardDismiss>
        <TextInput testID="field" />
      </Container>,
    );

    fireEvent(screen.getByTestId('field'), 'focus');
    fireEvent.changeText(screen.getByTestId('field'), 'query');
    expect(dismissSpy).not.toHaveBeenCalled();

    dismissSpy.mockRestore();
  });

  it('WHEN spacing props are typed THEN raw number is not assignable to Spacing keys', () => {
    type RejectsNumber = number extends import('@ds/tokens').Spacing ? true : false;
    const rejectsNumber: RejectsNumber = false;
    expect(rejectsNumber).toBe(false);

    type HasPadding = 'padding' extends keyof ContainerProps ? true : false;
    const hasPadding: HasPadding = false;
    expect(hasPadding).toBe(false);
  });
});
