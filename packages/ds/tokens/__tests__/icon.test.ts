import { icon } from '../icon';
import { sizes } from '../sizes';

describe('icon tokens', () => {
  it.each([
    ['xs', sizes.xs],
    ['sm', sizes.sm],
    ['md', sizes.md],
    ['lg', sizes.lg],
    ['xl', sizes.xl],
  ] as const)('WHEN variant is %s THEN token size matches sizes scale', (variant, expected) => {
    expect(icon[variant].size).toBe(expected);
  });
});
