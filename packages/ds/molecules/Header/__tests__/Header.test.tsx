import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getTheme } from '@ds/theme';
import { render, screen } from '@/test';

import { Header, type HeaderProps } from '../Header';

const safeAreaMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Header molecule (DS-08, DS-09)', () => {
  it('WHEN rendered THEN it shows the title', async () => {
    await render(<Header title="Repositories" />);

    expect(screen.getByText('Repositories')).toBeTruthy();
  });

  it('WHEN rendered THEN it sets accessibilityRole header on the chrome', async () => {
    await render(<Header title="Home" />);

    expect(screen.getByTestId('ds-header').props.accessibilityRole).toBe('header');
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

  it('WHEN safe is omitted THEN it does not apply safe-area padding-top', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Header title="No safe" />
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId('ds-header')).not.toHaveStyleRule('padding-top', 47);
  });

  it('WHEN safe is true THEN it applies safe-area top inset as padding-top', async () => {
    await render(
      <SafeAreaProvider initialMetrics={safeAreaMetrics}>
        <Header title="Safe" safe />
      </SafeAreaProvider>,
    );

    expect(screen.getByTestId('ds-header')).toHaveStyleRule('padding-top', 47);
  });

  it('WHEN rendered THEN chrome uses theme background and border colors', async () => {
    await render(<Header title="Chrome" />, { themeMode: 'light' });
    const theme = getTheme('light');

    expect(screen.getByTestId('ds-header')).toHaveStyleRule(
      'background-color',
      theme.colors.background,
    );
    expect(screen.getByTestId('ds-header')).toHaveStyleRule(
      'border-bottom-color',
      theme.colors.border,
    );
  });

  it('WHEN Header source is inspected THEN it does not import DataSourceLogo or brand assets', () => {
    const source = readFileSync(join(__dirname, '../Header.tsx'), 'utf8');
    expect(source).not.toMatch(/DataSourceLogo/);
    expect(source).not.toMatch(/\.svg['"]/);
    expect(source).not.toMatch(/assets\/github/);
    expect(source).not.toMatch(/assets\/gitlab/);
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof HeaderProps ? true : false;
    type HasSafe = 'safe' extends keyof HeaderProps ? true : false;
    const hasStyle: HasStyle = true;
    const hasSafe: HasSafe = true;
    expect(hasStyle).toBe(true);
    expect(hasSafe).toBe(true);

    await render(<Header title="Styled" style={{ opacity: 0.5 }} />);
    expect(screen.getByTestId('ds-header')).toHaveStyle({ opacity: 0.5 });
  });
});
