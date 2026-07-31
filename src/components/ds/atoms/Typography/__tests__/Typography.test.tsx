import { getTheme, useAppTheme } from '@/components/ds/theme';
import { sizes, typography } from '@/components/ds/tokens';
import { act, fireEvent, render, screen } from '@/test';
import { Pressable } from 'react-native';

import { Typography, type TypographyProps } from '../Typography';

describe('Typography atom (DSC-03)', () => {
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

  it('WHEN tone is primary and dataSource flips THEN text color updates to the new primary', async () => {
    function Harness() {
      const { setDataSource } = useAppTheme();
      return (
        <>
          <Typography tone="primary" testID="typo">
            Primary
          </Typography>
          <Pressable
            testID="flip-datasource"
            onPress={() => {
              setDataSource('gitlab');
            }}
          />
        </>
      );
    }

    await render(<Harness />, { themeMode: 'light' });

    expect(screen.getByTestId('typo').props.style).toEqual(
      expect.objectContaining({
        color: '#0FBF3E',
      }),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('flip-datasource'));
    });

    expect(screen.getByTestId('typo').props.style).toEqual(
      expect.objectContaining({
        color: '#FC6D26',
      }),
    );
  });

  it('WHEN variant is heading THEN it applies typography token metrics', async () => {
    await render(
      <Typography variant="heading" testID="heading">
        Title
      </Typography>,
    );

    expect(screen.getByTestId('heading').props.style).toEqual(
      expect.objectContaining({
        fontFamily: typography.heading.fontFamily,
        fontWeight: typography.heading.fontWeight,
        lineHeight: typography.heading.lineHeight,
        fontSize: sizes.xl,
      }),
    );
  });

  it('WHEN variant is body THEN it applies body fontFamily weight and lineHeight from tokens', async () => {
    await render(
      <Typography variant="body" testID="body">
        Body
      </Typography>,
    );

    expect(screen.getByTestId('body').props.style).toEqual(
      expect.objectContaining({
        fontFamily: typography.body.fontFamily,
        fontWeight: typography.body.fontWeight,
        lineHeight: typography.body.lineHeight,
      }),
    );
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof TypographyProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
