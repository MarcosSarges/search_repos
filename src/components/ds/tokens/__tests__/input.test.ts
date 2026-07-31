import { input, inputStateMap } from '../input';
import type { InputState } from '../input';

describe('input tokens (CTRL-02 foundation)', () => {
  it('WHEN state map is inspected THEN default maps to border and error maps to danger', () => {
    expect(inputStateMap.default).toBe('border');
    expect(inputStateMap.error).toBe('danger');
  });

  it('WHEN layout tokens are inspected THEN single density exposes padding radius and minHeight', () => {
    expect(input.paddingHorizontal).toEqual(expect.any(Number));
    expect(input.paddingVertical).toEqual(expect.any(Number));
    expect(input.radius).toBe('md');
    expect(input.minHeight).toEqual(expect.any(Number));
    expect(input.state).toBe(inputStateMap);
  });

  it('WHEN InputState keys are default and error THEN both resolve via the state map', () => {
    const states: InputState[] = ['default', 'error'];
    for (const state of states) {
      expect(inputStateMap[state]).toEqual(expect.any(String));
    }
  });

  it('WHEN token chrome maps are inspected THEN they do not hardcode brand hex colors', () => {
    const serialized = JSON.stringify({ input, inputStateMap });
    expect(serialized).not.toMatch(/#[0-9A-Fa-f]{3,8}/);
  });
});
