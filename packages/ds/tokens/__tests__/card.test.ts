import { card } from '../card';
import * as tokens from '../index';

describe('card tokens (PROP-06, PROP-19)', () => {
  it('WHEN card chrome tokens are inspected THEN radius borderColorToken and defaultBg exist', () => {
    expect(card.radius).toBe('md');
    expect(card.borderColorToken).toBe('border');
    expect(card.defaultBg).toBe('surface');
  });

  it('WHEN card fields are inspected THEN surfaceTone is absent (renamed to defaultBg)', () => {
    expect(card).not.toHaveProperty('surfaceTone');
    expect(card).toHaveProperty('defaultBg');
  });

  it('WHEN tokens barrel is inspected THEN card.defaultBg is surface', () => {
    expect(tokens.card.defaultBg).toBe('surface');
  });

  it('WHEN token chrome maps are inspected THEN they do not hardcode brand hex colors', () => {
    const serialized = JSON.stringify(card);
    expect(serialized).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });
});
