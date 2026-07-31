import { render, screen } from '@/test';
import { getTheme } from '@/components/ds/theme';
import { sizes } from '@/components/ds/tokens';

import { Typography, type TypographyProps } from '../Typography';

describe('Typography atom (DS-03, DS-09)', () => {
  it('WHEN rendered with body variant and size THEN it uses theme size tokens', async () => {
    await render(
      <Typography variant="body" size="lg">
        Hello body
      </Typography>,
    );

    const node = screen.getByText('Hello body');
    expect(node).toBeTruthy();
    expect(node.props.style).toEqual(
      expect.objectContaining({
        fontSize: sizes.lg,
      }),
    );
  });

  it('WHEN tone is muted THEN color uses theme muted token', async () => {
    await render(
      <Typography tone="muted" testID="typo">
        Muted
      </Typography>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('typo').props.style).toEqual(
      expect.objectContaining({
        color: theme.colors.muted,
      }),
    );
  });

  it('WHEN tone is primary THEN color follows theme primary for github light', async () => {
    await render(
      <Typography tone="primary" testID="typo">
        Primary
      </Typography>,
      { themeMode: 'light' },
    );

    expect(screen.getByTestId('typo').props.style).toEqual(
      expect.objectContaining({
        color: '#0FBF3E',
      }),
    );
  });

  it('WHEN variant is heading THEN it renders with heading weight', async () => {
    await render(
      <Typography variant="heading" testID="heading">
        Title
      </Typography>,
    );

    expect(screen.getByTestId('heading').props.style).toEqual(
      expect.objectContaining({
        fontWeight: '600',
        fontSize: sizes.xl,
      }),
    );
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof TypographyProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
