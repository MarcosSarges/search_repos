import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Badge, normalizeHex, type BadgeProps } from '../Badge';

describe('Badge atom (RDI-02)', () => {
  it('WHEN children are provided THEN it renders the label text', async () => {
    await render(<Badge>bug</Badge>);

    expect(screen.getByText('bug')).toBeTruthy();
  });

  it('WHEN swatch has no hash THEN normalizeHex prepends #', () => {
    expect(normalizeHex('ff0000')).toBe('#ff0000');
  });

  it('WHEN swatch already has hash THEN normalizeHex keeps it', () => {
    expect(normalizeHex('#ff0000')).toBe('#ff0000');
  });

  it('WHEN swatch is provided THEN chip uses normalized accent border', async () => {
    await render(<Badge swatch="ff0000">bug</Badge>);

    expect(screen.getByTestId('ds-badge')).toHaveStyle({
      borderColor: '#ff0000',
    });
  });

  it('WHEN swatch is omitted THEN chip uses theme surface and border', async () => {
    await render(<Badge>enhancement</Badge>, { themeMode: 'light' });

    const theme = getTheme('light');
    expect(screen.getByTestId('ds-badge')).toHaveStyle({
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    });
  });

  it('WHEN style is passed THEN it is accepted and forwarded', async () => {
    type HasStyle = 'style' extends keyof BadgeProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(<Badge style={{ opacity: 0.4 }}>x</Badge>);
    expect(screen.getByTestId('ds-badge')).toHaveStyle({ opacity: 0.4 });
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'Badge.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Badge.stories.tsx'))).toBe(true);
  });

  it('WHEN atom sources are inspected THEN they do not import app stores', () => {
    const component = readFileSync(join(__dirname, '../Badge.tsx'), 'utf8');
    expect(component).not.toMatch(/@\/stores|@\/presentation|zustand/i);
  });
});
