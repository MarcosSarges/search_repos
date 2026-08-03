import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import * as Linking from 'expo-linking';
import { fireEvent, render, screen } from '@/test';
import { getTheme } from '@ds/theme';

import { Hyperlink, type HyperlinkProps } from '../Hyperlink';

jest.mock('expo-linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

describe('Hyperlink organism (RDI-01)', () => {
  beforeEach(() => {
    jest.mocked(Linking.openURL).mockReset();
    jest.mocked(Linking.openURL).mockResolvedValue(undefined as never);
  });

  it('WHEN pressed THEN it calls Linking.openURL with href', async () => {
    await render(<Hyperlink href="https://github.com/acme/repo">Abrir no site</Hyperlink>);

    fireEvent.press(screen.getByRole('link'));

    expect(Linking.openURL).toHaveBeenCalledWith('https://github.com/acme/repo');
  });

  it('WHEN rendered THEN text is underlined and uses primary color', async () => {
    await render(<Hyperlink href="https://example.com">Label</Hyperlink>, {
      themeMode: 'light',
    });

    const theme = getTheme('light');
    expect(screen.getByText('Label')).toHaveStyle({
      textDecorationLine: 'underline',
      color: theme.colors.primary,
    });
  });

  it('WHEN rendered THEN accessibilityRole is link and children are the label', async () => {
    await render(<Hyperlink href="https://example.com">Abrir no site</Hyperlink>);

    expect(screen.getByRole('link', { name: 'Abrir no site' })).toBeTruthy();
  });

  it('WHEN openURL rejects THEN it fails soft without throwing', async () => {
    jest.mocked(Linking.openURL).mockRejectedValueOnce(new Error('blocked'));

    await render(<Hyperlink href="https://bad.example">Bad</Hyperlink>);

    fireEvent.press(screen.getByRole('link'));
    await Promise.resolve();
    await Promise.resolve();

    expect(Linking.openURL).toHaveBeenCalledWith('https://bad.example');
  });

  it('WHEN style is passed THEN it is accepted on public props', async () => {
    type HasStyle = 'style' extends keyof HyperlinkProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(
      <Hyperlink href="https://example.com" style={{ opacity: 0.6 }}>
        Styled
      </Hyperlink>,
    );
    expect(screen.getByTestId('ds-hyperlink')).toHaveStyle({ opacity: 0.6 });
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'Hyperlink.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'Hyperlink.stories.tsx'))).toBe(true);
  });

  it('WHEN organism sources are inspected THEN they do not import Zustand or @/ app modules', () => {
    const component = readFileSync(join(__dirname, '../Hyperlink.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/zustand|@\/stores|@\/presentation|@\/domain/i);
    expect(styles).not.toMatch(/zustand|@\/stores|@\/presentation|@\/domain/i);
  });
});
