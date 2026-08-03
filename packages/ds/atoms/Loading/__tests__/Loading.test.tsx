import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Loading, type LoadingProps } from '../Loading';

describe('Loading atom (DS-06, DS-09)', () => {
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

  it('WHEN variant is lg THEN ActivityIndicator uses large size from loading token', async () => {
    await render(<Loading variant="lg" />);

    expect(screen.getByTestId('ds-loading').props.size).toBe('large');
  });

  it('WHEN public props are inspected THEN style size and color are not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof LoadingProps ? true : false;
    type HasSize = 'size' extends keyof LoadingProps ? true : false;
    type HasColor = 'color' extends keyof LoadingProps ? true : false;
    const hasStyle: HasStyle = false;
    const hasSize: HasSize = false;
    const hasColor: HasColor = false;
    expect(hasStyle).toBe(false);
    expect(hasSize).toBe(false);
    expect(hasColor).toBe(false);
  });
});
