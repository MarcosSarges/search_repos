import { Text } from 'react-native';

import { getTheme } from '@/components/ds/theme';
import { cleanup, fireEvent, render, screen } from '@/test';

import { InputField, type InputFieldProps } from '../InputField';

describe('InputField molecule (CTRL-03)', () => {
  afterEach(() => {
    cleanup();
  });

  it('WHEN rendered with label THEN it shows the label above the Input via Typography', async () => {
    await render(
      <InputField label="Email" value="" onChangeText={() => undefined} testID="field" />,
    );

    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByTestId('field')).toBeTruthy();
  });

  it('WHEN helperText is set AND error is absent THEN it shows helperText below the Input', async () => {
    await render(
      <InputField
        helperText="We never share your email"
        value=""
        onChangeText={() => undefined}
      />,
    );

    expect(screen.getByText('We never share your email')).toBeTruthy();
  });

  it('WHEN error is a non-empty string THEN it shows error (not helperText) and passes error state to Input', async () => {
    await render(
      <InputField
        error="Required"
        helperText="We never share your email"
        value=""
        onChangeText={() => undefined}
        testID="field"
      />,
      { themeMode: 'light' },
    );

    expect(screen.getByText('Required')).toBeTruthy();
    expect(screen.queryByText('We never share your email')).toBeNull();

    const theme = getTheme('light');
    expect(screen.getByTestId('field')).toHaveStyleRule('border-color', theme.colors.danger);
  });

  it('WHEN error is empty string THEN it is treated as no error and helperText may show', async () => {
    await render(
      <InputField
        error=""
        helperText="Optional hint"
        value=""
        onChangeText={() => undefined}
        testID="field"
      />,
      { themeMode: 'light' },
    );

    expect(screen.getByText('Optional hint')).toBeTruthy();
    expect(screen.queryByText('Required')).toBeNull();

    const theme = getTheme('light');
    expect(screen.getByTestId('field')).toHaveStyleRule('border-color', theme.colors.border);
  });

  it('WHEN leading and trailing are passed THEN they are forwarded to the inner Input', async () => {
    await render(
      <InputField
        leading={<Text testID="leading">L</Text>}
        trailing={<Text testID="trailing">T</Text>}
        value="x"
        onChangeText={() => undefined}
      />,
    );

    expect(screen.getByTestId('leading')).toBeTruthy();
    expect(screen.getByTestId('trailing')).toBeTruthy();
  });

  it('WHEN value and onChangeText are passed THEN they are forwarded to the inner Input', async () => {
    const onChangeText = jest.fn();
    await render(<InputField value="hello" onChangeText={onChangeText} />);

    const field = screen.getByTestId('ds-input-field');
    expect(field.props.value).toBe('hello');

    fireEvent.changeText(field, 'hello!');
    expect(onChangeText).toHaveBeenCalledWith('hello!');
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof InputFieldProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });

  it('WHEN public props are inspected THEN state is not part of the controlled API', () => {
    type HasState = 'state' extends keyof InputFieldProps ? true : false;
    const hasState: HasState = false;
    expect(hasState).toBe(false);
  });
});
