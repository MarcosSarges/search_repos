import { toneColorMap, type Tone } from '../tone';

describe('tone tokens', () => {
  it('WHEN tone variants are listed THEN they map to color tokens', () => {
    const expected: Record<Tone, string> = {
      default: 'text',
      muted: 'muted',
      primary: 'primary',
      danger: 'danger',
    };
    expect(toneColorMap).toEqual(expected);
  });
});
