import { spacerEdgeAxis, type SpacerEdge } from '../spacing';

const cases: [SpacerEdge, 'height' | 'width'][] = [
  ['top', 'height'],
  ['bottom', 'height'],
  ['left', 'width'],
  ['right', 'width'],
];

describe('spacer edge tokens', () => {
  it.each(cases)('WHEN edge is %s THEN axis is %s', (edge, axis) => {
    expect(spacerEdgeAxis[edge]).toBe(axis);
  });
});
