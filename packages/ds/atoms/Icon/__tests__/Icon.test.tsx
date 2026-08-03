import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';
import { icon } from '@ds/tokens';

import { Icon, type IconProps } from '../Icon';

describe('Icon atom (DS-04, DS-09)', () => {
  it('WHEN rendered with name and variant THEN it maps variant to icon token size', async () => {
    await render(<Icon name="search" variant="lg" />);

    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('font-size', icon.lg.size);
  });

  it('WHEN tone is primary THEN color follows theme primary for github light', async () => {
    await render(<Icon name="star" tone="primary" />);

    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('color', '#0FBF3E');
  });

  it('WHEN tone is muted THEN color uses theme muted token', async () => {
    await render(<Icon name="information-circle" tone="muted" />);

    const theme = getTheme('light');
    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('color', theme.colors.muted);
  });

  it('WHEN public props are inspected THEN style size and color are not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof IconProps ? true : false;
    type HasSize = 'size' extends keyof IconProps ? true : false;
    type HasColor = 'color' extends keyof IconProps ? true : false;
    const hasStyle: HasStyle = false;
    const hasSize: HasSize = false;
    const hasColor: HasColor = false;
    expect(hasStyle).toBe(false);
    expect(hasSize).toBe(false);
    expect(hasColor).toBe(false);
  });
});
