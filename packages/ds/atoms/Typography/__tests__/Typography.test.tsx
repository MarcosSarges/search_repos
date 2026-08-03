import { Pressable } from 'react-native';

import { getTheme, useAppTheme } from '@/components/ds/theme';
import { typography } from '@/components/ds/tokens';
import { act, fireEvent, render, screen } from '@/test';

import { Typography, type TypographyProps } from '../Typography';

describe('Typography atom (DSC-03)', () => {
  it('WHEN rendered with body variant THEN it applies token fontSize and lineHeight', async () => {
    await render(<Typography variant="body">Hello body</Typography>);

    const node = screen.getByText('Hello body');
    expect(node).toBeTruthy();
    expect(node).toHaveStyleRule('font-size', typography.body.fontSize);
    expect(node).toHaveStyleRule('line-height', typography.body.lineHeight);
  });

  it('WHEN tone is muted THEN color uses theme muted token', async () => {
    await render(
      <Typography tone="muted" testID="typo">
        Muted
      </Typography>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('typo')).toHaveStyleRule('color', theme.colors.muted);
  });

  it('WHEN tone is primary THEN color follows theme primary for github light', async () => {
    await render(
      <Typography tone="primary" testID="typo">
        Primary
      </Typography>,
      { themeMode: 'light' },
    );

    expect(screen.getByTestId('typo')).toHaveStyleRule('color', '#0FBF3E');
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

    expect(screen.getByTestId('typo')).toHaveStyleRule('color', '#0FBF3E');

    await act(async () => {
      fireEvent.press(screen.getByTestId('flip-datasource'));
    });

    expect(screen.getByTestId('typo')).toHaveStyleRule('color', '#FC6D26');
  });

  it('WHEN variant is heading THEN it applies the complete heading token metrics', async () => {
    await render(
      <Typography variant="heading" testID="heading">
        Title
      </Typography>,
    );

    const node = screen.getByTestId('heading');
    expect(node).toHaveStyleRule('font-family', typography.heading.fontFamily);
    expect(node).toHaveStyleRule('font-weight', typography.heading.fontWeight);
    expect(node).toHaveStyleRule('font-size', typography.heading.fontSize);
    expect(node).toHaveStyleRule('line-height', typography.heading.lineHeight);
  });

  it('WHEN variant is body THEN it applies the complete body token metrics', async () => {
    await render(
      <Typography variant="body" testID="body">
        Body
      </Typography>,
    );

    const node = screen.getByTestId('body');
    expect(node).toHaveStyleRule('font-family', typography.body.fontFamily);
    expect(node).toHaveStyleRule('font-weight', typography.body.fontWeight);
    expect(node).toHaveStyleRule('font-size', typography.body.fontSize);
    expect(node).toHaveStyleRule('line-height', typography.body.lineHeight);
  });

  it('WHEN public props are inspected THEN style and size are not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof TypographyProps ? true : false;
    type HasSize = 'size' extends keyof TypographyProps ? true : false;
    const hasStyle: HasStyle = false;
    const hasSize: HasSize = false;
    expect(hasStyle).toBe(false);
    expect(hasSize).toBe(false);
  });
});
