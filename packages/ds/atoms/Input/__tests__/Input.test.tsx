import { Text } from 'react-native';

import { getTheme } from '@ds/theme';
import { input } from '@ds/tokens';
import { cleanup, fireEvent, render, screen } from '@/test';

import { Input, type InputProps } from '../Input';

describe('Input atom (CTRL-02)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN rendered THEN bordered chrome uses theme border token (no hardcoded colors)', async () => {
    await render(<Input testID="field" value="" onChangeText={() => undefined} />, {
      themeMode: 'light',
    });

    const theme = getTheme('light');
    expect(screen.getByTestId('field')).toHaveStyleRule('border-color', theme.colors.border);
  });

  it('WHEN leading and trailing are passed THEN they render in leading→field→trailing order', async () => {
    await render(
      <Input
        leading={<Text testID="leading">L</Text>}
        trailing={<Text testID="trailing">T</Text>}
        value="typed"
        onChangeText={() => undefined}
      />,
    );

    const chrome = screen.getByTestId('ds-input');
    const regions = chrome.children.filter(
      (child): child is (typeof chrome.children)[number] & object => typeof child !== 'string',
    );

    expect(regions).toHaveLength(3);
    expect(screen.getByTestId('leading')).toBeTruthy();
    expect(regions[1]).toHaveProp('testID', 'ds-input-field');
    expect(regions[1]).toHaveProp('value', 'typed');
    expect(screen.getByTestId('trailing')).toBeTruthy();
    expect(chrome).toHaveTextContent('LT');
  });

  it('WHEN value and onChangeText are used THEN the field is controlled', async () => {
    const onChangeText = jest.fn();
    await render(<Input value="hello" onChangeText={onChangeText} />);

    const field = screen.getByTestId('ds-input-field');
    expect(field).toHaveProp('value', 'hello');

    fireEvent.changeText(field, 'hello!');
    expect(onChangeText).toHaveBeenCalledWith('hello!');
  });

  it('WHEN state is error THEN border uses danger token mapping', async () => {
    await render(<Input state="error" testID="field" value="" onChangeText={() => undefined} />, {
      themeMode: 'light',
    });

    const theme = getTheme('light');
    expect(screen.getByTestId('field')).toHaveStyleRule('border-color', theme.colors.danger);
  });

  it('WHEN state is default or omitted THEN default border mapping applies', async () => {
    await render(<Input testID="field" value="" onChangeText={() => undefined} />, {
      themeMode: 'light',
    });

    const theme = getTheme('light');
    expect(screen.getByTestId('field')).toHaveStyleRule(
      'border-color',
      theme.colors[input.state.default],
    );
  });

  it('WHEN editable is false THEN the field does not accept edits and exposes disabled a11y', async () => {
    const onChangeText = jest.fn();
    await render(<Input editable={false} value="locked" onChangeText={onChangeText} />);

    const field = screen.getByTestId('ds-input-field');
    expect(field).toHaveProp('editable', false);
    expect(field).toHaveProp('accessibilityState', expect.objectContaining({ disabled: true }));

    fireEvent.changeText(field, 'nope');
    expect(onChangeText).not.toHaveBeenCalled();
  });

  it('WHEN no leading or trailing THEN chrome still layouts the text field', async () => {
    await render(<Input value="only" onChangeText={() => undefined} />);

    expect(screen.getByTestId('ds-input')).toBeTruthy();
    expect(screen.getByTestId('ds-input-field')).toHaveProp('value', 'only');
    expect(screen.queryByTestId('leading')).toBeNull();
    expect(screen.queryByTestId('trailing')).toBeNull();
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof InputProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(
      <Input testID="field" style={{ opacity: 0.6 }} value="" onChangeText={() => undefined} />,
    );

    expect(screen.getByTestId('field')).toHaveStyle({ opacity: 0.6 });
  });
});
