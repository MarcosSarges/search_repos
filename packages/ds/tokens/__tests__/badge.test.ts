import { getTheme } from '../../theme/theme';
import { badge } from '../badge';
import * as tokens from '../index';

describe('badge tokens (RDI-02)', () => {
  it('WHEN badge tokens are inspected THEN padding and radius are object-map numbers', () => {
    expect(badge).toEqual(
      expect.objectContaining({
        paddingVertical: expect.any(Number),
        paddingHorizontal: expect.any(Number),
        radius: expect.any(Number),
      }),
    );
  });

  it('WHEN tokens barrel is inspected THEN badge is exported', () => {
    expect('badge' in tokens).toBe(true);
  });

  it('WHEN getTheme is called THEN theme exposes badge token slice', () => {
    const theme = getTheme('light');
    expect(theme.badge).toBe(badge);
  });
});
