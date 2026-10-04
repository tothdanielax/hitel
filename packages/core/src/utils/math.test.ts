import { describe, expect, it } from 'vite-plus/test';
import { arrangements, clamp, subsets, sum } from './math';

describe('sum', () => {
  it('adds values', () => {
    expect(sum([1, 2, 3])).toBe(6);
  });

  it('is zero for no values', () => {
    expect(sum([])).toBe(0);
  });
});

describe('clamp', () => {
  it('raises values below the range', () => {
    expect(clamp(1, 5, 10)).toBe(5);
  });

  it('lowers values above the range', () => {
    expect(clamp(20, 5, 10)).toBe(10);
  });
});

describe('subsets', () => {
  it('lists every combination including the empty one', () => {
    expect(subsets(['a', 'b'])).toEqual([[], ['a'], ['b'], ['a', 'b']]);
  });
});

describe('arrangements', () => {
  it('lists every ordering of every subset', () => {
    expect(arrangements(['a', 'b'])).toEqual([[], ['a'], ['a', 'b'], ['b'], ['b', 'a']]);
  });

  it('grows to 65 for four items', () => {
    expect(arrangements([1, 2, 3, 4])).toHaveLength(65);
  });
});
