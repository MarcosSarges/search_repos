import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { sizes } from '@ds/tokens';
import { render, screen } from '@/test';

import { DataSourceLogo, type DataSourceLogoProps } from '../DataSourceLogo';
import { resolveLogoAsset } from '../styles';

describe('DataSourceLogo organism (DSLIB-06)', () => {
  it('WHEN brand is github and mode is light THEN it uses the black Invertocat asset', async () => {
    await render(<DataSourceLogo brand="github" />, { themeMode: 'light' });

    expect(screen.getByTestId('ds-datasource-logo-github-black')).toBeTruthy();
    expect(resolveLogoAsset('github', 'light')).toBe('github-black');
  });

  it('WHEN brand is github and mode is dark THEN it uses the white Invertocat asset', async () => {
    await render(<DataSourceLogo brand="github" />, { themeMode: 'dark' });

    expect(screen.getByTestId('ds-datasource-logo-github-white')).toBeTruthy();
    expect(resolveLogoAsset('github', 'dark')).toBe('github-white');
  });

  it('WHEN brand is gitlab and mode is light THEN it uses a GitLab logo SVG', async () => {
    await render(<DataSourceLogo brand="gitlab" />, { themeMode: 'light' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
    expect(resolveLogoAsset('gitlab', 'light')).toBe('gitlab');
  });

  it('WHEN brand is gitlab and mode is dark THEN it still uses the GitLab logo asset', async () => {
    await render(<DataSourceLogo brand="gitlab" />, { themeMode: 'dark' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
    expect(resolveLogoAsset('gitlab', 'dark')).toBe('gitlab');
  });

  it('WHEN brand prop is omitted THEN it falls back to theme.brand', async () => {
    await render(<DataSourceLogo />, { themeMode: 'light', dataSource: 'gitlab' });

    expect(screen.getByTestId('ds-datasource-logo-gitlab')).toBeTruthy();
  });

  it('WHEN size token is provided THEN the logo scales to that size token in px', async () => {
    await render(<DataSourceLogo brand="github" size="xl" />);

    const node = screen.getByTestId('ds-datasource-logo-github-black');
    expect(node.props.width).toBe(sizes.xl);
    expect(node.props.height).toBe(sizes.xl);
  });

  it('WHEN size is omitted THEN it defaults to the md size token', async () => {
    await render(<DataSourceLogo brand="github" />);

    const node = screen.getByTestId('ds-datasource-logo-github-black');
    expect(node.props.width).toBe(sizes.md);
    expect(node.props.height).toBe(sizes.md);
  });

  it('WHEN logoComponentMap source is inspected THEN each asset key maps to the matching SVG import', () => {
    const source = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(source).toContain(
      "import GitHubInvertocatBlack from '../../assets/github/GitHub_Invertocat_Black.svg'",
    );
    expect(source).toContain(
      "import GitHubInvertocatWhite from '../../assets/github/GitHub_Invertocat_White_Clearspace.svg'",
    );
    expect(source).toContain(
      "import GitLabLogo from '../../assets/gitlab/gitlab-logo-500-rgb.svg'",
    );
    expect(source).toContain("'github-black': GitHubInvertocatBlack");
    expect(source).toContain("'github-white': GitHubInvertocatWhite");
    expect(source).toContain('gitlab: GitLabLogo');
  });

  it('WHEN organism sources are inspected THEN they do not import application or useAppTheme', () => {
    const component = readFileSync(join(__dirname, '../DataSourceLogo.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');

    expect(component).not.toMatch(/@\/application|useAppTheme|dataSource\?:/);
    expect(styles).not.toMatch(/@\/application/);
    expect(component).toMatch(/brand\?:/);
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof DataSourceLogoProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
