import { getTheme } from '../../theme/theme';
import { avatar, type AvatarSize } from '../avatar';
import * as tokens from '../index';

describe('avatar tokens (RDI-02)', () => {
  it.each([
    ['sm', 24],
    ['md', 40],
    ['lg', 56],
    ['xl', 72],
  ] as const)('WHEN size is %s THEN pixel size is %s', (size, expected) => {
    expect(avatar[size].size).toBe(expected);
  });

  it('WHEN AvatarSize keys are listed THEN they are sm md lg xl', () => {
    const keys: AvatarSize[] = ['sm', 'md', 'lg', 'xl'];
    expect(Object.keys(avatar).sort()).toEqual([...keys].sort());
  });

  it('WHEN tokens barrel is inspected THEN avatar is exported', () => {
    expect('avatar' in tokens).toBe(true);
  });

  it('WHEN getTheme is called THEN theme exposes avatar token slice', () => {
    const theme = getTheme('light');
    expect(theme.avatar).toBe(avatar);
  });
});
