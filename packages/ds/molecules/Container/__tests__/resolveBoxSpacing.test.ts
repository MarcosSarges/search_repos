import { spacing } from '@ds/tokens';

import { resolveBoxSpacing } from '../resolveBoxSpacing';

describe('resolveBoxSpacing (DSLIB-07)', () => {
  it('WHEN p alone THEN all padding edges use that token', () => {
    const result = resolveBoxSpacing(spacing, { p: 'md' });

    expect(result.paddingTop).toBe(spacing.md);
    expect(result.paddingRight).toBe(spacing.md);
    expect(result.paddingBottom).toBe(spacing.md);
    expect(result.paddingLeft).toBe(spacing.md);
  });

  it('WHEN p and pt THEN pt overrides top only', () => {
    const result = resolveBoxSpacing(spacing, { p: 'md', pt: 'xl' });

    expect(result.paddingTop).toBe(spacing.xl);
    expect(result.paddingRight).toBe(spacing.md);
    expect(result.paddingBottom).toBe(spacing.md);
    expect(result.paddingLeft).toBe(spacing.md);
  });

  it('WHEN px and py THEN axes resolve independently', () => {
    const result = resolveBoxSpacing(spacing, { px: 'sm', py: 'lg' });

    expect(result.paddingTop).toBe(spacing.lg);
    expect(result.paddingBottom).toBe(spacing.lg);
    expect(result.paddingLeft).toBe(spacing.sm);
    expect(result.paddingRight).toBe(spacing.sm);
  });

  it('WHEN p then px then pr THEN more specific wins on that edge', () => {
    const result = resolveBoxSpacing(spacing, { p: 'xs', px: 'md', pr: 'xl' });

    expect(result.paddingLeft).toBe(spacing.md);
    expect(result.paddingRight).toBe(spacing.xl);
    expect(result.paddingTop).toBe(spacing.xs);
    expect(result.paddingBottom).toBe(spacing.xs);
  });

  it('WHEN m alone THEN all margin edges use that token', () => {
    const result = resolveBoxSpacing(spacing, { m: 'sm' });

    expect(result.marginTop).toBe(spacing.sm);
    expect(result.marginRight).toBe(spacing.sm);
    expect(result.marginBottom).toBe(spacing.sm);
    expect(result.marginLeft).toBe(spacing.sm);
  });

  it('WHEN mx my and mt THEN margin precedence matches padding', () => {
    const result = resolveBoxSpacing(spacing, { m: 'xs', mx: 'md', my: 'sm', mt: 'xl' });

    expect(result.marginTop).toBe(spacing.xl);
    expect(result.marginBottom).toBe(spacing.sm);
    expect(result.marginLeft).toBe(spacing.md);
    expect(result.marginRight).toBe(spacing.md);
  });

  it('WHEN spacing props are omitted THEN edges and gap are 0', () => {
    const result = resolveBoxSpacing(spacing, {});

    expect(result).toEqual({
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      gap: 0,
    });
  });

  it('WHEN gap is set THEN it maps the token to a number', () => {
    const result = resolveBoxSpacing(spacing, { gap: 'lg' });

    expect(result.gap).toBe(spacing.lg);
  });
});
