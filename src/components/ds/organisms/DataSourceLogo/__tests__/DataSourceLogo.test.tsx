import { render, screen } from '@/test';
import { sizes } from '@/components/ds/tokens';

import { DataSourceLogo, type DataSourceLogoProps } from '../DataSourceLogo';

describe('DataSourceLogo organism (DS-10, DS-11)', () => {
  it('WHEN dataSource is github and mode is light THEN it uses the black Invertocat asset', async () => {
    await render(<DataSourceLogo dataSource="github" />, { themeMode: 'light' });

    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
  });

  it('WHEN dataSource is github and mode is dark THEN it uses the white Invertocat asset', async () => {
    await render(<DataSourceLogo dataSource="github" />, { themeMode: 'dark' });

    expect(screen.getByTestId('ds-datasource-logo-github-white')).toBeTruthy();
  });

  it('WHEN dataSource is gitlab THEN it uses a GitLab logo SVG from assets/gitlab', async () => {
    await render(<DataSourceLogo dataSource="gitlab" />, { themeMode: 'light' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
  });

  it('WHEN dataSource is gitlab in dark mode THEN it still uses the GitLab logo asset', async () => {
    await render(<DataSourceLogo dataSource="gitlab" />, { themeMode: 'dark' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
  });

  it('WHEN size token is provided THEN the logo scales to that size token in px', async () => {
    await render(<DataSourceLogo dataSource="github" size="xl" />);

    const node = screen.getByTestId('ds-datasource-logo-github-black');
    expect(node.props.width).toBe(sizes.xl);
    expect(node.props.height).toBe(sizes.xl);
  });

  it('WHEN size is omitted THEN it defaults to the md size token', async () => {
    await render(<DataSourceLogo dataSource="github" />);

    const node = screen.getByTestId('ds-datasource-logo-github-black');
    expect(node.props.width).toBe(sizes.md);
    expect(node.props.height).toBe(sizes.md);
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof DataSourceLogoProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
