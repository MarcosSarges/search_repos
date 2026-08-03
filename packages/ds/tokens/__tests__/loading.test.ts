import { loading, type LoadingSize } from '../loading';
import * as tokens from '../index';

describe('loading tokens (PROP-18)', () => {
  it('WHEN size is sm THEN indicatorSize is small', () => {
    expect(loading.sm.indicatorSize).toBe('small');
  });

  it('WHEN size is lg THEN indicatorSize is large', () => {
    expect(loading.lg.indicatorSize).toBe('large');
  });

  it('WHEN LoadingSize keys are listed THEN they are sm | lg', () => {
    const keys: LoadingSize[] = ['sm', 'lg'];
    expect(Object.keys(loading).sort()).toEqual([...keys].sort());
  });

  it('WHEN tokens barrel is inspected THEN LoadingVariant value export is absent', () => {
    expect('loading' in tokens).toBe(true);
    expect('LoadingVariant' in tokens).toBe(false);
  });
});
