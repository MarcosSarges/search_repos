import { View } from 'react-native';

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
    expect(node).toHaveStyleRule('padding-top', spacing.md);
    expect(node).toHaveStyleRule('padding-bottom', spacing.md);
    expect(node).toHaveStyleRule('padding-left', spacing.md);
    expect(node).toHaveStyleRule('padding-right', spacing.md);
  });

  it('WHEN padding is xl THEN it applies theme.spacing.xl as padding', async () => {
    await render(
      <Container padding="xl">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.xl);
    expect(node).toHaveStyleRule('padding-bottom', spacing.xl);
    expect(node).toHaveStyleRule('padding-left', spacing.xl);
    expect(node).toHaveStyleRule('padding-right', spacing.xl);
  });

  it('WHEN padding is xs THEN it applies theme.spacing.xs as padding', async () => {
    await render(
      <Container padding="xs">
        <View />
      </Container>,
    );

    const node = screen.getByTestId('ds-container');
    expect(node).toHaveStyleRule('padding-top', spacing.xs);
    expect(node).toHaveStyleRule('padding-bottom', spacing.xs);
    expect(node).toHaveStyleRule('padding-left', spacing.xs);
    expect(node).toHaveStyleRule('padding-right', spacing.xs);
  });

  it('WHEN tone is surface THEN background uses theme.colors.surface', async () => {
    await render(
      <Container tone="surface">
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

  it('WHEN tone is background THEN background uses theme.colors.background', async () => {
    await render(
      <Container tone="background">
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

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof ContainerProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
