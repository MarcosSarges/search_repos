import { icon, type IconSize } from '../icon';
import { sizes } from '../sizes';
import * as tokens from '../index';

describe('icon tokens (PROP-17)', () => {
  it.each([
    ['xs', sizes.xs],
    ['sm', sizes.sm],
    ['md', sizes.md],
    ['lg', sizes.lg],
    ['xl', sizes.xl],
  ] as const)('WHEN size is %s THEN token size matches sizes scale', (size, expected) => {
    expect(icon[size].size).toBe(expected);
  });

  it('WHEN IconSize keys are listed THEN they are xs sm md lg xl', () => {
    const keys: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    expect(Object.keys(icon).sort()).toEqual([...keys].sort());
  });

  it('WHEN tokens barrel is inspected THEN IconSize is exported and IconVariant is not', () => {
    expect('icon' in tokens).toBe(true);
    // Type-only exports are erased; ensure IconVariant value export is absent
    expect('IconVariant' in tokens).toBe(false);
  });
});
