import { StyleSheet } from 'react-native';

import { render, screen } from '@/test';
import { getTheme } from '@/components/ds/theme';
import { sizes } from '@/components/ds/tokens';

import { Icon, type IconProps } from '../Icon';

describe('Icon atom (DS-04, DS-09)', () => {
  it('WHEN rendered with name and size THEN it maps size to theme size tokens', async () => {
    await render(<Icon name="search" size="lg" />);

    const node = screen.getByRole('image');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        fontSize: sizes.lg,
      }),
    );
  });

  it('WHEN tone is primary THEN color follows theme primary for github light', async () => {
    await render(<Icon name="star" tone="primary" />);

    const node = screen.getByRole('image');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        color: '#0FBF3E',
      }),
    );
  });

  it('WHEN tone is muted THEN color uses theme muted token', async () => {
    await render(<Icon name="information-circle" tone="muted" />);

    const theme = getTheme('light');
    const node = screen.getByRole('image');
    expect(StyleSheet.flatten(node.props.style)).toEqual(
      expect.objectContaining({
        color: theme.colors.muted,
      }),
    );
  });

  it('WHEN public props are inspected THEN style is not part of the controlled API', () => {
    type HasStyle = 'style' extends keyof IconProps ? true : false;
    const hasStyle: HasStyle = false;
    expect(hasStyle).toBe(false);
  });
});
