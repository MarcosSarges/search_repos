import { button, buttonVariants, buttonColors, buttonWidths } from '../button';
import type {
  ButtonSize,
  ButtonVariant,
  ButtonColor,
  ButtonWidth,
} from '../button';

describe('button tokens (PROP-09..12, PROP-15, PROP-16)', () => {
  it('WHEN size keys are inspected THEN sm md lg exist with padding minHeight and loadingSize', () => {
    const sizes: ButtonSize[] = ['sm', 'md', 'lg'];

    for (const size of sizes) {
      expect(button[size]).toEqual(
        expect.objectContaining({
          paddingVertical: expect.any(Number),
          paddingHorizontal: expect.any(Number),
          minHeight: expect.any(Number),
          loadingSize: expect.stringMatching(/^(sm|lg)$/),
        }),
      );
    }
  });

  it('WHEN size is sm or md THEN loadingSize is sm; WHEN lg THEN loadingSize is lg', () => {
    expect(button.sm.loadingSize).toBe('sm');
    expect(button.md.loadingSize).toBe('sm');
    expect(button.lg.loadingSize).toBe('lg');
  });

  it('WHEN ButtonVariant keys are inspected THEN contained outlined text are present', () => {
    const variants: ButtonVariant[] = ['contained', 'outlined', 'text'];

    for (const variant of variants) {
      expect(buttonVariants[variant]).toBe(true);
    }
  });

  it('WHEN ButtonColor keys are inspected THEN primary success warning danger are present', () => {
    const colors: ButtonColor[] = ['primary', 'success', 'warning', 'danger'];

    for (const color of colors) {
      expect(buttonColors[color]).toBe(true);
    }
  });

  it('WHEN ButtonWidth keys are inspected THEN hug and full are present', () => {
    const widths: ButtonWidth[] = ['hug', 'full'];

    for (const width of widths) {
      expect(buttonWidths[width]).toBe(true);
    }
  });

  it('WHEN public variant keys are inspected THEN legacy primary outline ghost are absent', () => {
    expect(buttonVariants).not.toHaveProperty('primary');
    expect(buttonVariants).not.toHaveProperty('outline');
    expect(buttonVariants).not.toHaveProperty('ghost');
  });

  it('WHEN size token fields are inspected THEN loadingVariant is absent (renamed to loadingSize)', () => {
    for (const size of ['sm', 'md', 'lg'] as const) {
      expect(button[size]).not.toHaveProperty('loadingVariant');
      expect(button[size]).toHaveProperty('loadingSize');
    }
  });

  it('WHEN token chrome maps are inspected THEN they do not hardcode brand hex colors', () => {
    const serialized = JSON.stringify({
      button,
      buttonVariants,
      buttonColors,
      buttonWidths,
    });
    expect(serialized).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });
});
