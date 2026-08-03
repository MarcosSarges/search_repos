import { contentColors, type ContentColor } from '../content-color';
import type { ColorToken } from '../colors';
import * as tokens from '../index';

describe('content-color tokens (PROP-01, PROP-02, PROP-03)', () => {
  it('WHEN ContentColor union is listed THEN it is text | muted | primary | danger', () => {
    const expected: ContentColor[] = ['text', 'muted', 'primary', 'danger'];
    expect([...contentColors]).toEqual(expected);
  });

  it('WHEN ContentColor values are checked THEN each is a ColorToken (theme.colors key)', () => {
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
    for (const color of contentColors) {
      expect(colorTokens).toContain(color);
    }
  });

  it('WHEN tokens barrel is inspected THEN ContentColor is exported and Tone / toneColorMap are not', () => {
    expect('contentColors' in tokens).toBe(true);
    expect('Tone' in tokens).toBe(false);
    expect('toneColorMap' in tokens).toBe(false);
    expect('SurfaceTone' in tokens).toBe(false);
  });
});
