import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { View } from 'react-native';

import { fireEvent, render, screen } from '@/test';

import { SourceHeader, type SourceHeaderProps } from '../SourceHeader';

describe('SourceHeader organism (RDI-03)', () => {
  it('WHEN rendered THEN it shows the title', async () => {
    await render(
      <SourceHeader title="Repositories" brand="github" onToggleBrand={() => undefined} />,
    );

    expect(screen.getByText('Repositories')).toBeTruthy();
  });

  it('WHEN trailing control is pressed THEN it calls onToggleBrand', async () => {
    const onToggleBrand = jest.fn();
    await render(
      <SourceHeader title="Home" brand="github" onToggleBrand={onToggleBrand} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Alternar fonte de dados' }));

    expect(onToggleBrand).toHaveBeenCalledTimes(1);
  });

  it('WHEN brand is gitlab THEN logo reflects gitlab', async () => {
    await render(
      <SourceHeader title="Home" brand="gitlab" onToggleBrand={() => undefined} />,
      { themeMode: 'light' },
    );

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
  });

  it('WHEN brand is github THEN logo reflects github', async () => {
    await render(
      <SourceHeader title="Home" brand="github" onToggleBrand={() => undefined} />,
      { themeMode: 'light' },
    );

    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
  });

  it('WHEN leading is provided THEN it is forwarded to Header', async () => {
    await render(
      <SourceHeader
        title="Detalhes"
        brand="github"
        onToggleBrand={() => undefined}
        leading={<View testID="ds-source-header-leading" />}
      />,
    );

    expect(screen.getByTestId('ds-source-header-leading')).toBeTruthy();
  });

  it('WHEN rendered THEN root testID defaults to ds-source-header', async () => {
    await render(
      <SourceHeader title="Home" brand="github" onToggleBrand={() => undefined} />,
    );

    expect(screen.getByTestId('ds-source-header')).toBeTruthy();
  });

  it('WHEN style is passed THEN it is accepted on public props', async () => {
    type HasStyle = 'style' extends keyof SourceHeaderProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);
  });

  it('WHEN folder is inspected THEN AD-012 files exist', () => {
    const dir = join(__dirname, '..');
    expect(existsSync(join(dir, 'index.ts'))).toBe(true);
    expect(existsSync(join(dir, 'SourceHeader.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'styles.tsx'))).toBe(true);
    expect(existsSync(join(dir, 'SourceHeader.stories.tsx'))).toBe(true);
  });

  it('WHEN organism sources are inspected THEN they do not import Zustand or @/ app modules', () => {
    const component = readFileSync(join(__dirname, '../SourceHeader.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(component).not.toMatch(/zustand|@\/stores|@\/presentation|from ['"]@\//i);
    expect(styles).not.toMatch(/zustand|@\/stores|@\/presentation|from ['"]@\//i);
  });
});
