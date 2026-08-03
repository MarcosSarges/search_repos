import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Loading, type LoadingProps } from '../Loading';

describe('Loading atom (PROP-18, PROP-20)', () => {
  it('WHEN shown in light mode THEN indicator color is theme.colors.primary (not hardcoded)', async () => {
    await render(<Loading />, { themeMode: 'light' });

    const theme = getTheme('light', 'github');
    const node = screen.getByTestId('ds-loading');
    expect(node.props.color).toBe(theme.colors.primary);
    expect(node.props.color).toBe('#0FBF3E');
  });

  it('WHEN shown in dark mode THEN indicator remains theme primary (visible brand color)', async () => {
    await render(<Loading />, { themeMode: 'dark' });

    const theme = getTheme('dark', 'github');
    const node = screen.getByTestId('ds-loading');
    expect(node.props.color).toBe(theme.colors.primary);
    expect(node.props.color).toBe('#5FED83');
  });

  it('WHEN size is lg THEN ActivityIndicator uses large size from loading token', async () => {
    await render(<Loading size="lg" />);

    expect(screen.getByTestId('ds-loading').props.size).toBe('large');
  });

  it('WHEN size is sm THEN ActivityIndicator uses small size from loading token', async () => {
    await render(<Loading size="sm" />);

    expect(screen.getByTestId('ds-loading').props.size).toBe('small');
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof LoadingProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(<Loading testID="ds-loading" style={{ opacity: 0.3 }} />);
    expect(screen.getByTestId('ds-loading')).toHaveStyle({ opacity: 0.3 });
  });

  it('WHEN public props are inspected THEN size is DS prop and variant is not', () => {
    type HasSize = 'size' extends keyof LoadingProps ? true : false;
    type HasVariant = 'variant' extends keyof LoadingProps ? true : false;
    type HasColor = 'color' extends keyof LoadingProps ? true : false;
    const hasSize: HasSize = true;
    const hasVariant: HasVariant = false;
    const hasColor: HasColor = false;
    expect(hasSize).toBe(true);
    expect(hasVariant).toBe(false);
    expect(hasColor).toBe(false);
  });
});
