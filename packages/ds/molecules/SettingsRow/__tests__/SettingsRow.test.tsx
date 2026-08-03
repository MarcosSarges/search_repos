import { Text } from 'react-native';

import { cleanup, fireEvent, render, screen } from '@/test';

import { SettingsRow, type SettingsRowProps } from '../SettingsRow';

describe('SettingsRow molecule (DIC-10)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN rendered THEN it shows icon, title, and default testID', async () => {
    await render(<SettingsRow icon="moon-outline" title="Tema" />);

    expect(screen.getByText('Tema')).toBeTruthy();
    expect(screen.getByTestId('ds-settings-row')).toBeTruthy();
  });

  it('WHEN subtitle is set THEN it shows the supporting subtitle', async () => {
    await render(
      <SettingsRow icon="key-outline" title="Token de API" subtitle="Em breve" />,
    );

    expect(screen.getByText('Token de API')).toBeTruthy();
    expect(screen.getByText('Em breve')).toBeTruthy();
  });

  it('WHEN subtitle is omitted THEN no subtitle text is rendered', async () => {
    await render(<SettingsRow icon="moon-outline" title="Tema" />);

    expect(screen.getByText('Tema')).toBeTruthy();
    expect(screen.queryByTestId('ds-settings-row-subtitle')).toBeNull();
  });

  it('WHEN trailing is passed THEN it is rendered', async () => {
    await render(
      <SettingsRow
        icon="sunny-outline"
        title="Tema"
        trailing={<Text testID="trailing-slot">Toggle</Text>}
      />,
    );

    expect(screen.getByTestId('trailing-slot')).toBeTruthy();
  });

  it('WHEN onPress is set THEN the row is a button and invokes onPress', async () => {
    const onPress = jest.fn();
    await render(<SettingsRow icon="moon-outline" title="Tema" onPress={onPress} />);

    const row = screen.getByTestId('ds-settings-row');
    expect(row.props.accessibilityRole).toBe('button');

    fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('WHEN onPress is omitted THEN the row is static (not a button)', async () => {
    await render(<SettingsRow icon="git-branch-outline" title="Fonte ativa" />);

    const row = screen.getByTestId('ds-settings-row');
    expect(row.props.accessibilityRole).not.toBe('button');
  });

  it('WHEN style and testID are passed THEN they are accepted on the public props', async () => {
    type HasStyle = 'style' extends keyof SettingsRowProps ? true : false;
    type HasTestID = 'testID' extends keyof SettingsRowProps ? true : false;
    const hasStyle: HasStyle = true;
    const hasTestID: HasTestID = true;
    expect(hasStyle).toBe(true);
    expect(hasTestID).toBe(true);

    await render(
      <SettingsRow
        icon="moon-outline"
        title="Tema"
        style={{ opacity: 0.5 }}
        testID="custom-settings-row"
      />,
    );

    expect(screen.getByTestId('custom-settings-row')).toHaveStyle({ opacity: 0.5 });
  });
});
