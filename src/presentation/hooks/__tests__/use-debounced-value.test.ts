import { act, renderHook } from '@testing-library/react-native';

import { SEARCH_DEBOUNCE_MS } from '../../constants/search';
import { useDebouncedValue } from '../use-debounced-value';

describe('useDebouncedValue (SRCH-02)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('WHEN value changes THEN debounced value updates after default delay (350ms)', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: 'react' } },
    );

    expect(result.current).toBe('react');

    await rerender({ value: 'react-native' });
    expect(result.current).toBe('react');

    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 1);
    });
    expect(result.current).toBe('react');

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('react-native');
  });

  it('WHEN value changes rapidly THEN only the latest value wins after delay', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, SEARCH_DEBOUNCE_MS),
      { initialProps: { value: 'a' } },
    );

    await rerender({ value: 'ab' });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ value: 'abc' });
    await act(async () => {
      jest.advanceTimersByTime(100);
    });
    await rerender({ value: 'abcd' });

    expect(result.current).toBe('a');

    await act(async () => {
      jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
    });
    expect(result.current).toBe('abcd');
  });

  it('WHEN custom delayMs is provided THEN updates after that delay', async () => {
    const customDelay = 200;
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, customDelay),
      { initialProps: { value: 'x' } },
    );

    await rerender({ value: 'xy' });
    await act(async () => {
      jest.advanceTimersByTime(customDelay - 1);
    });
    expect(result.current).toBe('x');

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('xy');
  });
});
