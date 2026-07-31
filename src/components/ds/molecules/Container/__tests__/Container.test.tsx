import { StyleSheet, View } from 'react-native';

import { render, screen } from '@/test';
import { getTheme } from '@/components/ds/theme';
import { spacing } from '@/components/ds/tokens';

import { Container, type ContainerProps } from '../Container';

describe('Container molecule (DS-07, DS-09)', () => {
  it('WHEN padding is md THEN it applies theme.spacing.md as padding', async () => {
    await render(
      <Container padding="md">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
      }),
    );
  });

  it('WHEN padding is xl THEN it applies theme.spacing.xl as padding', async () => {
    await render(
      <Container padding="xl">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
        paddingLeft: spacing.xl,
        paddingRight: spacing.xl,
      }),
    );
  });

  it('WHEN padding is xs THEN it applies theme.spacing.xs as padding', async () => {
    await render(
      <Container padding="xs">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        paddingTop: spacing.xs,
        paddingBottom: spacing.xs,
        paddingLeft: spacing.xs,
        paddingRight: spacing.xs,
      }),
    );
  });

  it('WHEN tone is surface THEN background uses theme.colors.surface', async () => {
    await render(
      <Container tone="surface">
        <View />
      </Container>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    const node = screen.getByTestId('ds-container');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: theme.colors.surface,
      }),
    );
  });

  it('WHEN tone is background THEN background uses theme.colors.background', async () => {
    await render(
      <Container tone="background">
        <View />
      </Container>,
      { themeMode: 'dark' },
    );

    const theme = getTheme('dark');
    const node = screen.getByTestId('ds-container');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        backgroundColor: theme.colors.background,
      }),
    );
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof ContainerProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
