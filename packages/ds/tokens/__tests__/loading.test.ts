import { loading } from '../loading';

describe('loading tokens', () => {
  it('WHEN variant is sm THEN indicatorSize is small', () => {
    expect(loading.sm.indicatorSize).toBe('small');
  });

  it('WHEN variant is lg THEN indicatorSize is large', () => {
    expect(loading.lg.indicatorSize).toBe('large');
  });
});
