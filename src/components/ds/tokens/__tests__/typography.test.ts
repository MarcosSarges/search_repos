import { getTheme } from '../../theme/theme';
import { SYSTEM_FONT_FAMILY, typography } from '../typography';

describe('typography tokens (DSC-03)', () => {
  it.each([
    ['body', { fontFamily: SYSTEM_FONT_FAMILY, fontWeight: '400', lineHeight: 22 }],
    ['label', { fontFamily: SYSTEM_FONT_FAMILY, fontWeight: '600', lineHeight: 22 }],
    ['caption', { fontFamily: SYSTEM_FONT_FAMILY, fontWeight: '400', lineHeight: 18 }],
    ['heading', { fontFamily: SYSTEM_FONT_FAMILY, fontWeight: '600', lineHeight: 34 }],
  ] as const)(
    'WHEN variant is %s THEN token has the exact fontFamily, fontWeight, and lineHeight',
    (variant, expected) => {
      expect(typography[variant]).toEqual(expected);
    },
  );

  it('WHEN getTheme runs THEN theme.typography exposes the typography token map', () => {
    const theme = getTheme('light', 'github');
    expect(theme.typography).toEqual(typography);
    expect(theme.typography.body.fontWeight).toBe('400');
    expect(theme.typography.heading.fontWeight).toBe('600');
    expect(theme.typography.caption.lineHeight).toBe(18);
  });
});
