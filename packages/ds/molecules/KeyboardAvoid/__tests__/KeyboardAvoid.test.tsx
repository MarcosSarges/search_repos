import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { View } from 'react-native';

import { render, screen } from '@/test';

import { Container } from '../../Container';
import {
  KeyboardAvoid,
  keyboardAvoidBehaviorByOs,
  resolveKeyboardAvoidBehavior,
  type KeyboardAvoidProps,
} from '../KeyboardAvoid';

describe('KeyboardAvoid molecule (DSLIB-11)', () => {
  it('WHEN rendered THEN it mounts with the default testID', async () => {
    await render(
      <KeyboardAvoid>
        <View />
      </KeyboardAvoid>,
    );

    expect(screen.getByTestId('ds-keyboard-avoid')).toBeTruthy();
  });

  it('WHEN offset is provided THEN composition wires offset into the avoiding host attrs', () => {
    const composition = readFileSync(join(__dirname, '../KeyboardAvoid.tsx'), 'utf8');
    const styles = readFileSync(join(__dirname, '../styles.tsx'), 'utf8');
    expect(composition).toMatch(/\$offset=\{offset\}/);
    expect(styles).toMatch(/keyboardVerticalOffset:\s*\$offset/);
  });

  it('WHEN default behavior map is inspected THEN ios is padding and android is height (object map)', () => {
    expect(keyboardAvoidBehaviorByOs.ios).toBe('padding');
    expect(keyboardAvoidBehaviorByOs.android).toBe('height');
    expect(resolveKeyboardAvoidBehavior('ios')).toBe('padding');
    expect(resolveKeyboardAvoidBehavior('android')).toBe('height');
    expect(resolveKeyboardAvoidBehavior('web')).toBe('padding');
  });

  it('WHEN behavior override is passed THEN it wins over the platform default', () => {
    expect(resolveKeyboardAvoidBehavior('ios', 'height')).toBe('height');
    expect(resolveKeyboardAvoidBehavior('android', 'padding')).toBe('padding');
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof KeyboardAvoidProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });

  it('WHEN KeyboardAvoidProps are inspected THEN keyboard avoid is not required on Container', () => {
    const containerSource = readFileSync(join(__dirname, '../../Container/Container.tsx'), 'utf8');
    expect(containerSource).not.toMatch(/keyboardAvoid\?:/);
    expect(containerSource).not.toMatch(/KeyboardAvoid/);
  });

  it('WHEN nested with Container THEN both mount without a combined component', async () => {
    await render(
      <KeyboardAvoid>
        <Container testID="nested-container" p="md">
          <View testID="nested-child" />
        </Container>
      </KeyboardAvoid>,
    );

    expect(screen.getByTestId('ds-keyboard-avoid')).toBeTruthy();
    expect(screen.getByTestId('nested-container')).toBeTruthy();
    expect(screen.getByTestId('nested-child')).toBeTruthy();
  });
});
