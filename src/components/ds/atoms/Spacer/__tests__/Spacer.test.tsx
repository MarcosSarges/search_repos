import { StyleSheet } from 'react-native';

import { render, screen } from '@/test';
import { spacing } from '@/components/ds/tokens';

import { Spacer, type SpacerProps } from '../Spacer';

describe('Spacer atom (DS-05, DS-09)', () => {
  it('WHEN top edge and md size THEN it occupies vertical space from theme.spacing', async () => {
    await render(<Spacer top size="md" />);

    const node = screen.getByTestId('ds-spacer');
    expect(StyleSheet.flatten(node.props.style)).toEqual({ height: spacing.md });
  });

  it('WHEN left edge and lg size THEN it occupies horizontal space from theme.spacing', async () => {
    await render(<Spacer left size="lg" />);

    const node = screen.getByTestId('ds-spacer');
    expect(StyleSheet.flatten(node.props.style)).toEqual({ width: spacing.lg });
  });

  it('WHEN bottom edge and xs size THEN height matches spacing.xs', async () => {
    await render(<Spacer bottom size="xs" />);

    expect(StyleSheet.flatten(screen.getByTestId('ds-spacer').props.style)).toEqual({
      height: spacing.xs,
    });
  });

  it('WHEN right edge and xl size THEN width matches spacing.xl', async () => {
    await render(<Spacer right size="xl" />);

    expect(StyleSheet.flatten(screen.getByTestId('ds-spacer').props.style)).toEqual({
      width: spacing.xl,
    });
  });

  it('WHEN no edge is provided at runtime THEN it throws a guard error', async () => {
    const Invalid = () => {
      const props = { size: 'md' } as SpacerProps;
      return <Spacer {...props} />;
    };

    await expect(render(<Invalid />)).rejects.toThrow(/exactly one edge/);
  });
});
