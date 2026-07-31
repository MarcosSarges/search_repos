import { card } from '../card';

describe('card tokens (CTRL-04 foundation)', () => {
  it('WHEN card chrome tokens are inspected THEN radius borderColorToken and surfaceTone exist', () => {
    expect(card.radius).toBe('md');
    expect(card.borderColorToken).toBe('border');
    expect(card.surfaceTone).toBe('surface');
  });

  it('WHEN token chrome maps are inspected THEN they do not hardcode brand hex colors', () => {
    const serialized = JSON.stringify(card);
    expect(serialized).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });
});
