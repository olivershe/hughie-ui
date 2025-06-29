import { renderHook, act } from '@testing-library/react';
import useTypewriter from '../hooks/useTypewriter';

jest.useFakeTimers();

test('reveals characters over time', () => {
  const { result } = renderHook(() => useTypewriter('abc', 10));

  expect(result.current).toBe('');

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current).toBe('a');

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current).toBe('ab');

  act(() => {
    jest.advanceTimersByTime(100);
  });
  expect(result.current).toBe('abc');
});
