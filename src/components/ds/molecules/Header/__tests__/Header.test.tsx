import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { View } from 'react-native';

import { render, screen } from '@/test';

import { Header, type HeaderProps } from '../Header';

describe('Header molecule (DS-08, DS-09)', () => {
  it('WHEN rendered THEN it shows the title', async () => {
    await render(<Header title="Repositories" />);

    expect(screen.getByText('Repositories')).toBeTruthy();
  });

  it('WHEN rendered THEN it shows DataSourceLogo for the active data source', async () => {
    await render(<Header title="Home" />, { themeMode: 'light' });

    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
  });

  it('WHEN mode is dark THEN DataSourceLogo switches to the white Invertocat', async () => {
    await render(<Header title="Home" />, { themeMode: 'dark' });

    expect(screen.getByTestId('ds-datasource-logo-github-white')).toBeTruthy();
  });

  it('WHEN trailing is provided THEN it renders the trailing action', async () => {
    await render(
      <Header title="Home" trailing={<View testID="ds-header-trailing" />} />,
    );

    expect(screen.getByTestId('ds-header-trailing')).toBeTruthy();
  });

  it('WHEN trailing is omitted THEN title and logo still render', async () => {
    await render(<Header title="Only chrome" />);

    expect(screen.getByText('Only chrome')).toBeTruthy();
    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
    expect(screen.queryByTestId('ds-header-trailing')).toBeNull();
  });

  it('WHEN Header source is inspected THEN it does not import brand SVG assets', () => {
    const source = readFileSync(join(__dirname, '../Header.tsx'), 'utf8');
    expect(source).not.toMatch(/\.svg['"]/);
    expect(source).not.toMatch(/assets\/github/);
    expect(source).not.toMatch(/assets\/gitlab/);
    expect(source).toMatch(/DataSourceLogo/);
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof HeaderProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
