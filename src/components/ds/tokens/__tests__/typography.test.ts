import { getTheme } from '../../theme/theme';
import { SYSTEM_FONT_FAMILY, typography, type TypographyVariant } from '../typography';

const VARIANTS: TypographyVariant[] = ['body', 'label', 'caption', 'heading'];

describe('typography tokens (DSC-03)', () => {
  it.each(VARIANTS)(
    'WHEN variant is %s THEN token has fontFamily, fontWeight, and lineHeight',
    (variant) => {
      const token = typography[variant];
      expect(token.fontFamily).toBe(SYSTEM_FONT_FAMILY);
      expect(token.fontWeight).toMatch(/^400|600$/);
      expect(typeof token.lineHeight).toBe('number');
      expect(token.lineHeight).toBeGreaterThan(0);
    },
  );

  it('WHEN getTheme runs THEN theme.typography exposes the typography token map', () => {
    const theme = getTheme('light', 'github');
    expect(theme.typography).toEqual(typography);
    expect(theme.typography.heading.fontWeight).toBe('600');
    expect(theme.typography.caption.lineHeight).toBe(18);
  });
});
