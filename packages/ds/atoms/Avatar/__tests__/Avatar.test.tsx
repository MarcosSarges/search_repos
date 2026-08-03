import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { act, render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Avatar, type AvatarProps } from '../Avatar';

describe('Avatar atom (RDI-02)', () => {
  it('WHEN uri is provided THEN it renders an image', async () => {
    await render(<Avatar uri="https://example.com/avatar.png" name="Ada Lovelace" />);

    expect(screen.getByTestId('ds-avatar-image')).toBeTruthy();
  });

  it('WHEN uri is omitted THEN it renders initials from name', async () => {
    await render(<Avatar name="Ada Lovelace" />);

    expect(screen.getByText('AL')).toBeTruthy();
    expect(screen.queryByTestId('ds-avatar-image')).toBeNull();
  });

  it('WHEN image errors THEN it falls back to initials', async () => {
    await render(<Avatar uri="https://example.com/broken.png" name="Ada Lovelace" />);

    const image = screen.getByTestId('ds-avatar-image');
    await act(async () => {
      image.props.onError?.({ nativeEvent: { error: 'load failed' } });
    });

    expect(screen.getByText('AL')).toBeTruthy();
  });

  it('WHEN size is lg THEN root uses avatar token 56px', async () => {
    await render(<Avatar name="Ada" size="lg" />);

    const theme = getTheme('light');
    expect(screen.getByTestId('ds-avatar')).toHaveStyle({
      width: theme.avatar.lg.size,
      height: theme.avatar.lg.size,
    });
  });

  it('WHEN size is omitted THEN it defaults to md (40px)', async () => {
    await render(<Avatar name="Ada" />);

    const theme = getTheme('light');
    expect(screen.getByTestId('ds-avatar')).toHaveStyle({
      width: theme.avatar.md.size,
      height: theme.avatar.md.size,
    });
  });

  it('WHEN style is passed THEN it is accepted and forwarded', async () => {
    type HasStyle = 'style' extends keyof AvatarProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(<Avatar name="Ada" style={{ opacity: 0.5 }} />);
    expect(screen.getByTestId('ds-avatar')).toHaveStyle({ opacity: 0.5 });
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'Avatar.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Avatar.stories.tsx'))).toBe(true);
  });

  it('WHEN atom sources are inspected THEN they do not import app stores or presentation', () => {
    const component = readFileSync(join(__dirname, '../Avatar.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/@\/stores|@\/presentation|zustand/i);
    expect(styles).not.toMatch(/@\/stores|@\/presentation|zustand/i);
  });
});
