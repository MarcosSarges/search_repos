import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Divider, type DividerProps } from '../Divider';

describe('Divider atom (RITEM-01, RITEM-02)', () => {
  it('WHEN orientation is horizontal (or omitted) THEN it renders a 1px-tall full-width line with theme.colors.border', async () => {
    await render(<Divider />, { themeMode: 'light' });

    const theme = getTheme('light');
    const node = screen.getByTestId('ds-divider');
    expect(node).toHaveStyle({
      height: 1,
      width: '100%',
      backgroundColor: theme.colors.border,
    });
  });

  it('WHEN orientation is vertical THEN it renders a 1px-wide stretch line with theme.colors.border', async () => {
    await render(<Divider orientation="vertical" />, { themeMode: 'light' });

    const theme = getTheme('light');
    const node = screen.getByTestId('ds-divider');
    expect(node).toHaveStyle({
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: theme.colors.border,
    });
  });

  it('WHEN public props are inspected THEN orientation is typed as horizontal | vertical', () => {
    type Orientation = NonNullable<DividerProps['orientation']>;
    type IsUnion = Orientation extends 'horizontal' | 'vertical'
      ? 'horizontal' | 'vertical' extends Orientation
        ? true
        : false
      : false;
    const ok: IsUnion = true;
    expect(ok).toBe(true);
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'Divider.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Divider.stories.tsx'))).toBe(true);
  });

  it('WHEN styles source is inspected THEN orientation chrome uses an object map (no switch)', () => {
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(styles).toMatch(/orientationChrome/);
    expect(styles).not.toMatch(/\bswitch\b/);
  });

  it('WHEN atom sources are inspected THEN they do not import app layers', () => {
    const component = readFileSync(join(__dirname, '../Divider.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/from ['"]@\//);
    expect(styles).not.toMatch(/from ['"]@\//);
  });
});
