import { render, screen } from '@/test';
import { spacing } from '@ds/tokens';

import { Spacer, type SpacerProps } from '../Spacer';

describe('Spacer atom (DS-05, DS-09)', () => {
  it('WHEN top edge and md size THEN it occupies vertical space from theme.spacing', async () => {
    await render(<Spacer top size="md" />);

    expect(screen.getByTestId('ds-spacer')).toHaveStyleRule('height', spacing.md);
  });

  it('WHEN left edge and lg size THEN it occupies horizontal space from theme.spacing', async () => {
    await render(<Spacer left size="lg" />);

    expect(screen.getByTestId('ds-spacer')).toHaveStyleRule('width', spacing.lg);
  });

  it('WHEN bottom edge and xs size THEN height matches spacing.xs', async () => {
    await render(<Spacer bottom size="xs" />);

    expect(screen.getByTestId('ds-spacer')).toHaveStyleRule('height', spacing.xs);
  });

  it('WHEN right edge and xl size THEN width matches spacing.xl', async () => {
    await render(<Spacer right size="xl" />);

    expect(screen.getByTestId('ds-spacer')).toHaveStyleRule('width', spacing.xl);
  });

  it('WHEN size is omitted THEN it defaults to spacing.md', async () => {
    await render(<Spacer top />);

    expect(screen.getByTestId('ds-spacer')).toHaveStyleRule('height', spacing.md);
  });

  it('WHEN style is passed THEN it is accepted on the public props type and forwarded', async () => {
    type HasStyle = 'style' extends keyof SpacerProps ? true : false;
    const hasStyle: HasStyle = true;
    expect(hasStyle).toBe(true);

    await render(<Spacer top style={{ opacity: 0.3 }} />);
    expect(screen.getByTestId('ds-spacer')).toHaveStyle({ opacity: 0.3 });
  });

  it('WHEN no edge is provided at runtime THEN it throws a guard error', async () => {
    const Invalid = () => {
      const props = { size: 'md' } as SpacerProps;
      return <Spacer {...props} />;
    };

    await expect(render(<Invalid />)).rejects.toThrow(/exactly one edge/);
  });
});
