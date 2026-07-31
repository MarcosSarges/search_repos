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

  it('WHEN leading is provided THEN it renders the leading slot', async () => {
    await render(<Header title="Home" leading={<View testID="ds-header-leading" />} />);

    expect(screen.getByTestId('ds-header-leading')).toBeTruthy();
  });

  it('WHEN trailing is provided THEN it renders the trailing action', async () => {
    await render(<Header title="Home" trailing={<View testID="ds-header-trailing" />} />);

    expect(screen.getByTestId('ds-header-trailing')).toBeTruthy();
  });

  it('WHEN leading and trailing are provided THEN both slots and title render', async () => {
    await render(
      <Header
        title="Mid"
        leading={<View testID="ds-header-leading" />}
        trailing={<View testID="ds-header-trailing" />}
      />,
    );

    expect(screen.getByTestId('ds-header')).toHaveTextContent('Mid');
    expect(screen.getByTestId('ds-header-leading')).toBeTruthy();
    expect(screen.getByTestId('ds-header-trailing')).toBeTruthy();
  });

  it('WHEN slots are omitted THEN only title chrome renders', async () => {
    await render(<Header title="Only chrome" />);

    expect(screen.getByText('Only chrome')).toBeTruthy();
    expect(screen.queryByTestId('ds-header-leading')).toBeNull();
    expect(screen.queryByTestId('ds-header-trailing')).toBeNull();
  });

  it('WHEN Header source is inspected THEN it does not import DataSourceLogo or brand assets', () => {
    const source = readFileSync(join(__dirname, '../Header.tsx'), 'utf8');
    expect(source).not.toMatch(/DataSourceLogo/);
    expect(source).not.toMatch(/\.svg['"]/);
    expect(source).not.toMatch(/assets\/github/);
    expect(source).not.toMatch(/assets\/gitlab/);
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof HeaderProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
