import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';
import { icon } from '@ds/tokens';

import { Icon, type IconProps } from '../Icon';

describe('Icon atom (PROP-01, PROP-02, PROP-17, PROP-20)', () => {
  it('WHEN rendered with name and size THEN it maps size to icon token size', async () => {
    await render(<Icon name="search" size="lg" />);

    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('font-size', icon.lg.size);
  });

  it('WHEN color is primary THEN color follows theme primary for github light', async () => {
    await render(<Icon name="star" color="primary" />);

    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('color', '#0FBF3E');
  });

  it('WHEN color is muted THEN color uses theme muted token', async () => {
    await render(<Icon name="information-circle" color="muted" />);

    const theme = getTheme('light');
    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('color', theme.colors.muted);
  });

  it('WHEN color is omitted THEN foreground uses theme.colors.text', async () => {
    await render(<Icon name="star" testID="icon" />);

    const theme = getTheme('light');
    const node = screen.getByRole('image');
    expect(node).toHaveStyleRule('color', theme.colors.text);
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof IconProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(<Icon name="star" testID="icon" style={{ opacity: 0.4 }} />);
    expect(screen.getByTestId('icon')).toHaveStyle({ opacity: 0.4 });
  });

  it('WHEN public props are inspected THEN size and color are DS props and variant is not', () => {
    type HasSize = 'size' extends keyof IconProps ? true : false;
    type HasColor = 'color' extends keyof IconProps ? true : false;
    type HasVariant = 'variant' extends keyof IconProps ? true : false;
    type HasTone = 'tone' extends keyof IconProps ? true : false;
    const hasSize: HasSize = true;
    const hasColor: HasColor = true;
    const hasVariant: HasVariant = false;
    const hasTone: HasTone = false;
    expect(hasSize).toBe(true);
    expect(hasColor).toBe(true);
    expect(hasVariant).toBe(false);
    expect(hasTone).toBe(false);
  });
});
