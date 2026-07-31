import { getTheme } from '../../theme/theme';
import { SYSTEM_FONT_FAMILY, typography } from '../typography';

describe('typography tokens (DSC-03)', () => {
  it.each([
    [
      'body',
      {
        fontFamily: SYSTEM_FONT_FAMILY,
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 22,
      },
    ],
    [
      'label',
      {
        fontFamily: SYSTEM_FONT_FAMILY,
        fontWeight: '600',
        fontSize: 16,
        lineHeight: 22,
      },
    ],
    [
      'caption',
      {
        fontFamily: SYSTEM_FONT_FAMILY,
        fontWeight: '400',
        fontSize: 14,
        lineHeight: 18,
      },
    ],
    [
      'heading',
      {
        fontFamily: SYSTEM_FONT_FAMILY,
        fontWeight: '600',
        fontSize: 28,
        lineHeight: 34,
      },
    ],
  ] as const)(
    'WHEN variant is %s THEN token is a complete type style (fontFamily, weight, fontSize, lineHeight)',
    (variant, expected) => {
      expect(typography[variant]).toEqual(expected);
    },
  );

  it('WHEN getTheme runs THEN theme.typography exposes complete variant tokens', () => {
    const theme = getTheme('light', 'github');
    expect(theme.typography).toEqual(typography);
    expect(theme.typography.body.fontSize).toBe(16);
    expect(theme.typography.body.lineHeight).toBe(22);
    expect(theme.typography.heading.fontSize).toBe(28);
    expect(theme.typography.heading.lineHeight).toBe(34);
  });
});
