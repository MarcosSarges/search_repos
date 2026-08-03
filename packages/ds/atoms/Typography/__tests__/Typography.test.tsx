import { Pressable } from 'react-native';

import { getTheme } from '@ds/theme';
import { typography } from '@ds/tokens';
import { useAppTheme } from '@/presentation/theme';
import { act, fireEvent, render, screen } from '@/test';

import { Typography, type TypographyProps } from '../Typography';

describe('Typography atom (PROP-01, PROP-02, PROP-20)', () => {
  it('WHEN rendered with body variant THEN it applies token fontSize and lineHeight', async () => {
    await render(<Typography variant="body">Hello body</Typography>);

    const node = screen.getByText('Hello body');
    expect(node).toBeTruthy();
    expect(node).toHaveStyleRule('font-size', typography.body.fontSize);
    expect(node).toHaveStyleRule('line-height', typography.body.lineHeight);
  });

  it('WHEN color is muted THEN color uses theme muted token', async () => {
    await render(
      <Typography color="muted" testID="typo">
        Muted
      </Typography>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('typo')).toHaveStyleRule('color', theme.colors.muted);
  });

  it('WHEN color is primary THEN color follows theme primary for github light', async () => {
    await render(
      <Typography color="primary" testID="typo">
        Primary
      </Typography>,
      { themeMode: 'light' },
    );

    expect(screen.getByTestId('typo')).toHaveStyleRule('color', '#0FBF3E');
  });

  it('WHEN color is danger THEN color uses theme danger token', async () => {
    await render(
      <Typography color="danger" testID="typo">
        Danger
      </Typography>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('typo')).toHaveStyleRule('color', theme.colors.danger);
  });

  it('WHEN color is omitted THEN foreground uses theme.colors.text', async () => {
    await render(<Typography testID="typo">Default text</Typography>, { themeMode: 'light' });

    const theme = getTheme('light');
    expect(screen.getByTestId('typo')).toHaveStyleRule('color', theme.colors.text);
  });

  it('WHEN color is text THEN foreground uses theme.colors.text', async () => {
    await render(
      <Typography color="text" testID="typo">
        Explicit text
      </Typography>,
      { themeMode: 'light' },
    );

    const theme = getTheme('light');
    expect(screen.getByTestId('typo')).toHaveStyleRule('color', theme.colors.text);
  });

  it('WHEN color is primary and dataSource flips THEN text color updates to the new primary', async () => {
    function Harness() {
      const { setDataSource } = useAppTheme();
      return (
        <>
          <Typography color="primary" testID="typo">
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

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof TypographyProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(
      <Typography testID="typo" style={{ opacity: 0.5 }}>
        Styled
      </Typography>,
    );

    expect(screen.getByTestId('typo')).toHaveStyle({ opacity: 0.5 });
  });

  it('WHEN public props are inspected THEN size is not part of the API', () => {
    type HasSize = 'size' extends keyof TypographyProps ? true : false;
    const hasSize: HasSize = false;
    expect(hasSize).toBe(false);
  });

  it('WHEN public props are inspected THEN tone is not part of the API', () => {
    type HasTone = 'tone' extends keyof TypographyProps ? true : false;
    const hasTone: HasTone = false;
    expect(hasTone).toBe(false);
  });
});
