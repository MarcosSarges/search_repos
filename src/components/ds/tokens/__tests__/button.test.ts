import { button, buttonVariants } from '../button';
import type { ButtonSize, ButtonVariant } from '../button';

describe('button tokens (CTRL-01 foundation)', () => {
  it('WHEN size keys are inspected THEN sm md lg exist with padding minHeight and loadingVariant', () => {
    const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      expect(button[size]).toEqual(
        expect.objectContaining({
          paddingVertical: expect.any(Number),
          paddingHorizontal: expect.any(Number),
          minHeight: expect.any(Number),
          loadingVariant: expect.stringMatching(/^(sm|lg)$/),
        }),
      );
    }
  });

  it('WHEN size is sm or md THEN loadingVariant is sm; WHEN lg THEN loadingVariant is lg', () => {
    expect(button.sm.loadingVariant).toBe('sm');
    expect(button.md.loadingVariant).toBe('sm');
    expect(button.lg.loadingVariant).toBe('lg');
  });

  it('WHEN variant keys are inspected THEN primary outline ghost are present', () => {
    const variants: ButtonVariant[] = ['primary', 'outline', 'ghost'];

    for (const variant of variants) {
      expect(buttonVariants[variant]).toBe(true);
    }
  });

  it('WHEN token chrome maps are inspected THEN they do not hardcode brand hex colors', () => {
    const serialized = JSON.stringify({ button, buttonVariants });
    expect(serialized).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });
});
