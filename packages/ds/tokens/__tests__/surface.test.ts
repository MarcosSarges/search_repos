import { surfaceBgs, type SurfaceBg } from '../surface';
import type { ColorToken } from '../colors';
import * as tokens from '../index';

describe('surface tokens (PROP-03)', () => {
  it('WHEN SurfaceBg union is listed THEN it is background | surface', () => {
    const expected: SurfaceBg[] = ['background', 'surface'];
    expect([...surfaceBgs]).toEqual(expected);
  });

  it('WHEN SurfaceBg values are checked THEN each is a ColorToken (theme.colors key)', () => {
    const colorTokens: ColorToken[] = [
      'primary',
      'background',
      'surface',
      'text',
      'muted',
      'border',
      'success',
      'warning',
      'danger',
      'shadow',
    ];
    for (const bg of surfaceBgs) {
      expect(colorTokens).toContain(bg);
    }
  });

  it('WHEN tokens barrel is inspected THEN SurfaceBg is exported and Tone / SurfaceTone / toneColorMap are not', () => {
    expect('surfaceBgs' in tokens).toBe(true);
    expect('Tone' in tokens).toBe(false);
    expect('SurfaceTone' in tokens).toBe(false);
    expect('toneColorMap' in tokens).toBe(false);
  });
});
